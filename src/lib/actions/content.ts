'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { runCopywriter } from '@/lib/ai/agents/copywriter'
import { runContentCritic } from '@/lib/ai/agents/critic'
import { requireBusinessMembership, assertResourceInBusiness, assertText } from '@/lib/auth/business-access'

export async function createPillar(businessId: string, name: string, description: string) {
  const { supabase } = await requireBusinessMembership(businessId)
  assertText(name, 'Nama pillar', 120)
  assertText(description, 'Deskripsi pillar', 2_000)
  const { error } = await supabase.from('content_pillars').insert({
    business_id: businessId,
    name,
    description
  })

  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${businessId}/contents/pillars`)
  return { success: true }
}

export async function createIdea(businessId: string, pillarId: string, title: string, description: string) {
  const { supabase } = await requireBusinessMembership(businessId)
  await assertResourceInBusiness(supabase, 'content_pillars', pillarId, businessId)
  assertText(title, 'Judul ide', 200)
  assertText(description, 'Deskripsi ide', 4_000)
  const { error } = await supabase.from('content_ideas').insert({
    business_id: businessId,
    pillar_id: pillarId,
    title,
    description,
    status: 'pending'
  })

  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${businessId}/contents`)
  return { success: true }
}

export async function convertIdeaToDraft(businessId: string, ideaId: string, title: string) {
  const { supabase } = await requireBusinessMembership(businessId)
  await assertResourceInBusiness(supabase, 'content_ideas', ideaId, businessId)
  assertText(title, 'Judul konten', 200)

  const { data: content, error: contentError } = await supabase.from('contents').insert({
    idea_id: ideaId,
    title,
    status: 'draft'
  }).select('id').single()

  if (contentError) throw new Error(contentError.message)

  // Update idea status
  await supabase.from('content_ideas').update({ status: 'converted' }).eq('id', ideaId)

  revalidatePath(`/dashboard/${businessId}/contents`)
  return { success: true, contentId: content.id }
}

/**
 * Full auto pipeline: Ide → Generate AI → Evaluate AI Critic → Status final
 * Tidak perlu interaksi manual sama sekali.
 */
export async function autoProcessIdea(businessId: string, ideaId: string, title: string, description: string) {
  const { supabase } = await requireBusinessMembership(businessId)
  await assertResourceInBusiness(supabase, 'content_ideas', ideaId, businessId)
  assertText(title, 'Judul ide', 200)
  assertText(description, 'Deskripsi ide', 4_000)

  // 1. Buat brief otomatis dari judul + deskripsi ide
  const brief = description
    ? `Ide Utama: "${title}". Konteks: "${description}". Buat konten yang menarik, relevan, dan persuasif berdasarkan ide tersebut.`
    : `Ide Utama: "${title}". Buat konten yang menarik dan persuasif.`

  // 2. Jalankan Copywriter AI
  const aiResult = await runCopywriter(businessId, brief, 'Profesional & Engaging')

    const { error: ideaUpdateError } = await supabase.from('content_ideas').update({ status: 'converted' }).eq('id', ideaId).eq('business_id', businessId)
    if (ideaUpdateError) throw ideaUpdateError

  // 4. Simpan konten langsung dengan hasil AI
  const { data: content, error: contentError } = await supabase.from('contents').insert({
    business_id: businessId,
    idea_id: ideaId,
    title,
    hook: aiResult.hook,
    body: aiResult.body,
    cta: aiResult.cta,
    hashtags: aiResult.hashtags,
    status: 'generated'
  }).select('id').single()

  if (contentError) throw new Error(contentError.message)

  // 5. Auto-evaluasi dengan AI Critic
  const contentText = `Hook: ${aiResult.hook}\nBody: ${aiResult.body}\nCTA: ${aiResult.cta}`
  const review = await runContentCritic(businessId, contentText)

  const finalStatus = review.score >= 75 ? 'approved_recommended' : 'needs_improvement'

  const { error: finalUpdateError } = await supabase.from('contents').update({
    ai_score: review.score,
    ai_feedback: review.feedback,
    ai_claim_warnings: review.claim_warnings,
    status: finalStatus
  }).eq('id', content.id).eq('business_id', businessId)
  if (finalUpdateError) throw finalUpdateError

  revalidatePath(`/dashboard/${businessId}/contents`)
  return { success: true, contentId: content.id, score: review.score, status: finalStatus }
}


export async function generateContentBody(businessId: string, contentId: string, brief: string, toneOfVoice: string = "Profesional") {
  const { supabase } = await requireBusinessMembership(businessId)
  await assertResourceInBusiness(supabase, 'contents', contentId, businessId)
  assertText(brief, 'Brief', 4_000)
  assertText(toneOfVoice, 'Tone of voice', 200)
  
  try {
    // Jalankan agen COPYWRITER
    const aiResult = await runCopywriter(businessId, brief, toneOfVoice)
    
    // Update tabel contents
    const { error } = await supabase.from('contents').update({
      hook: aiResult.hook,
      body: aiResult.body,
      cta: aiResult.cta,
      hashtags: aiResult.hashtags,
      status: 'generated'
    }).eq('id', contentId)
      .eq('business_id', businessId)

    if (error) throw new Error(error.message)
      
    revalidatePath(`/dashboard/${businessId}/contents`)
    return { success: true }
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export async function evaluateContent(businessId: string, contentId: string) {
  const { supabase } = await requireBusinessMembership(businessId)
  await assertResourceInBusiness(supabase, 'contents', contentId, businessId)
  
  try {
    const { data: content, error: fetchError } = await supabase.from('contents').select('hook, body, cta').eq('id', contentId)
      .eq('business_id', businessId).single()
    if (fetchError || !content) throw new Error("Gagal mengambil data konten")
    
    const contentText = `Hook: ${content.hook}\nBody: ${content.body}\nCTA: ${content.cta}`
    
    const review = await runContentCritic(businessId, contentText)
    
    // Threshold 75
    const newStatus = review.score >= 75 ? 'approved_recommended' : 'needs_improvement'
    
    const { error: updateError } = await supabase.from('contents').update({
      ai_score: review.score,
      ai_feedback: review.feedback,
      ai_claim_warnings: review.claim_warnings,
      status: newStatus
    }).eq('id', contentId)
      .eq('business_id', businessId)

    if (updateError) throw new Error(updateError.message)
      
    revalidatePath(`/dashboard/${businessId}/contents`)
    return { success: true }
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export async function useIdeaFromBank(businessId: string, pillarId: string, title: string, description: string) {
  const { supabase } = await requireBusinessMembership(businessId)
  await assertResourceInBusiness(supabase, 'content_pillars', pillarId, businessId)
  assertText(title, 'Judul ide', 200)
  assertText(description, 'Deskripsi ide', 4_000)
  
  // 1. Create content_ideas row first
  const { data: idea, error: ideaError } = await supabase.from('content_ideas').insert({
    business_id: businessId,
    pillar_id: pillarId,
    title: title,
    description: description,
    status: 'converted'
  }).select('id').single()

  if (ideaError) throw new Error(ideaError.message)

  // 2. Create contents row linking to idea_id
  const { data, error } = await supabase.from('contents').insert({
    business_id: businessId,
    idea_id: idea.id,
    title: title,
    hook: description,
    status: 'draft'
  }).select().single()

  if (error) {
    console.error('Error using idea:', error)
    throw new Error(error.message)
  }

  revalidatePath(`/dashboard/${businessId}/contents`)
  revalidatePath(`/dashboard/${businessId}/contents/pillars`)
  
  return { success: true, data }
}

export async function autoGenerateFromIdeaBank(businessId: string, pillarId: string, title: string, description: string) {
  const { supabase } = await requireBusinessMembership(businessId)
  await assertResourceInBusiness(supabase, 'content_pillars', pillarId, businessId)
  assertText(title, 'Judul ide', 200)
  assertText(description, 'Deskripsi ide', 4_000)
  
  // 1. Buat brief otomatis yang cerdas
  let brief = `Ide Utama: "${title}". `
  if (description) {
    brief += `Konteks/Detail tambahan: "${description}". `
  }
  brief += `Buatkan konten/naskah yang sangat menarik berdasarkan ide tersebut.`

  try {
    // 2. Insert idea first
    const { data: idea, error: ideaError } = await supabase.from('content_ideas').insert({
      business_id: businessId,
      pillar_id: pillarId,
      title: title,
      description: description,
      status: 'converted'
    }).select('id').single()

    if (ideaError) throw new Error(ideaError.message)

    // 3. Jalankan Copywriter AI secara langsung
    const aiResult = await runCopywriter(businessId, brief, "Profesional & Menarik")
    
    // 4. Simpan langsung sebagai konten 'generated' (melewati fase draft)
    const { data: content, error } = await supabase.from('contents').insert({
      business_id: businessId,
      idea_id: idea.id,
      title: title,
      hook: aiResult.hook,
      body: aiResult.body,
      cta: aiResult.cta,
      hashtags: aiResult.hashtags,
      status: 'generated'
    }).select().single()

    if (error) {
      console.error('Error auto-generating from idea bank:', error)
      throw new Error(error.message)
    }

    revalidatePath(`/dashboard/${businessId}/contents`)
    revalidatePath(`/dashboard/${businessId}/contents/idea-bank`)
    
    return { success: true, contentId: content.id }
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export async function reviseContentWithAI(businessId: string, contentId: string) {
  const { supabase } = await requireBusinessMembership(businessId)
  await assertResourceInBusiness(supabase, 'contents', contentId, businessId)

  try {
    // 1. Ambil draft lama dan feedback
    const { data: content, error: fetchError } = await supabase.from('contents').select('*').eq('id', contentId)
      .eq('business_id', businessId).single()
    if (fetchError || !content) throw new Error("Gagal mengambil data konten")
    if (content.ai_score !== null && content.ai_score < 85) {
      throw new Error("Skor terlalu rendah, tidak diizinkan untuk Auto-Revisi.")
    }

    // 2. Buat brief baru
    const brief = `
DRAFT LAMA:
Hook: ${content.hook}
Body: ${content.body}
CTA: ${content.cta}

KRITIK & SARAN PERBAIKAN:
${content.ai_feedback}

PERINGATAN KLAIM BERLEBIHAN (OVERCLAIM):
${content.ai_claim_warnings?.join('\n')}

TUGAS:
Tulis ulang naskah konten tersebut. Pastikan Anda memperbaiki kelemahan sesuai Kritik & Saran, serta menghilangkan semua Peringatan Klaim. Buat naskah baru yang jauh lebih baik dan profesional.
    `

    // 3. Jalankan AI
    const aiResult = await runCopywriter(businessId, brief, "Profesional, Sesuai Kritik")

    // 4. Update konten dan reset skor
    const { error: updateError } = await supabase.from('contents').update({
      hook: aiResult.hook,
      body: aiResult.body,
      cta: aiResult.cta,
      hashtags: aiResult.hashtags,
      ai_score: null,
      ai_feedback: null,
      ai_claim_warnings: null,
      status: 'generated' // Kembali ke status generated agar bisa dievaluasi lagi
    }).eq('id', contentId)
      .eq('business_id', businessId)

    if (updateError) throw new Error(updateError.message)

    revalidatePath(`/dashboard/${businessId}/contents`)
    return { success: true }
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export async function saveManualEdit(businessId: string, contentId: string, hook: string, body: string, cta: string, hashtags: string[]) {
  const { supabase } = await requireBusinessMembership(businessId)
  await assertResourceInBusiness(supabase, 'contents', contentId, businessId)
  assertText(hook, 'Hook', 500)
  assertText(body, 'Body', 20_000)
  assertText(cta, 'CTA', 500)
  if (!Array.isArray(hashtags) || hashtags.length > 30 || hashtags.some(h => typeof h !== 'string' || h.length > 60)) {
    throw new Error('Hashtag tidak valid.')
  }
  const { error } = await supabase.from('contents').update({
    hook,
    body,
    cta,
    hashtags,
    ai_score: null,
    ai_feedback: null,
    ai_claim_warnings: null,
    status: 'generated'
  }).eq('id', contentId)
      .eq('business_id', businessId)

  if (error) throw new Error(error.message)

  revalidatePath(`/dashboard/${businessId}/contents`)
  return { success: true }
}

export async function scheduleContent(businessId: string, contentId: string, scheduledAt: string, platform: string) {
  const { supabase } = await requireBusinessMembership(businessId)
  await assertResourceInBusiness(supabase, 'contents', contentId, businessId)
  assertText(scheduledAt, 'Waktu jadwal', 100)
  assertText(platform, 'Platform', 30)
  const date = new Date(scheduledAt)
  if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) throw new Error('Waktu jadwal tidak valid.')
  const { error } = await supabase.from('contents').update({
    status: 'scheduled',
    scheduled_at: scheduledAt,
    platform: platform
  }).eq('id', contentId)
      .eq('business_id', businessId)

  if (error) throw new Error(error.message)

  revalidatePath(`/dashboard/${businessId}/calendar`)
  revalidatePath(`/dashboard/${businessId}/contents`)
  return { success: true }
}

export async function unscheduleContent(businessId: string, contentId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.from('contents').update({
    status: 'approved_recommended', // Kembalikan ke antrean
    scheduled_at: null,
    platform: null
  }).eq('id', contentId)
      .eq('business_id', businessId)

  if (error) throw new Error(error.message)

  revalidatePath(`/dashboard/${businessId}/calendar`)
  revalidatePath(`/dashboard/${businessId}/contents`)
  return { success: true }
}

export async function deleteContentIdea(businessId: string, ideaId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('content_ideas')
    .delete()
    .eq('id', ideaId)
    .eq('business_id', businessId)
  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${businessId}/contents/pillars`)
  return { success: true }
}

export async function deleteAllPendingIdeas(businessId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('content_ideas')
    .delete()
    .eq('business_id', businessId)
    .eq('status', 'pending')
  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${businessId}/contents/pillars`)
  return { success: true }
}

/** Hapus konten dari tabel contents + reset idea ke pending agar bisa di-generate ulang */
export async function deleteContent(businessId: string, contentId: string) {
  const { supabase } = await requireBusinessMembership(businessId)
  await assertResourceInBusiness(supabase, 'contents', contentId, businessId)

  // Ambil idea_id dulu sebelum hapus
  const { data: content } = await supabase
    .from('contents')
    .select('idea_id, status, scheduled_at')
    .eq('id', contentId)
    .eq('business_id', businessId)
    .single()

  if (!content) throw new Error('Konten tidak ditemukan.')
  if (content.scheduled_at || ['scheduled', 'published'].includes(content.status)) {
    throw new Error('Konten yang sudah dijadwalkan atau tayang tidak dapat dihapus dari antrean.')
  }

  // Hapus konten
  const { error } = await supabase
    .from('contents')
    .delete()
    .eq('id', contentId)
    .eq('business_id', businessId)

  if (error) throw new Error(error.message)

  // Reset idea ke pending agar bisa di-generate ulang
  if (content?.idea_id) {
    await supabase
      .from('content_ideas')
      .update({ status: 'pending' })
        .eq('id', content.idea_id)
        .eq('business_id', businessId)
  }

  revalidatePath(`/dashboard/${businessId}/contents`)
  revalidatePath(`/dashboard/${businessId}/contents/pillars`)
  revalidatePath(`/dashboard/${businessId}/calendar`)
  return { success: true }
}

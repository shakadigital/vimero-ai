'use server'

import { createClient } from '@/lib/supabase/server'
import { runResearcher } from '@/lib/ai/agents/researcher'
import { runCopywriter } from '@/lib/ai/agents/copywriter'
import { runContentCritic } from '@/lib/ai/agents/critic'
import { revalidatePath } from 'next/cache'
import { getErrorMessage } from '@/lib/utils'

export async function generateResearch(
  businessId: string,
  researchType: 'trend' | 'competitor' | 'audience' | 'keyword',
  _formData?: FormData
) {
  const supabase = await createClient()
  try {
    const result = await runResearcher(businessId, researchType)
    const insertData = result.items.map(item => ({
      business_id: businessId,
      type: researchType,
      title: item.title,
      content: item.content,
    }))
    const { error } = await supabase.from('research_items').insert(insertData)
    if (error) throw new Error(error.message)
    revalidatePath(`/dashboard/${businessId}/research`)
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, 'Gagal menghasilkan riset'))
  }
}

const CONTENT_VARIATIONS = [
  {
    label: 'Edukatif',
    tone: 'Edukatif & Informatif — Jelaskan konsep secara jelas, berikan fakta menarik, gunakan bahasa yang mudah dipahami namun tetap profesional.',
  },
  {
    label: 'Storytelling',
    tone: 'Santai & Relatable (Storytelling) — Mulai dengan cerita atau situasi yang relate, gunakan bahasa sehari-hari, buat pembaca merasa "itu gue banget".',
  },
  {
    label: 'Soft-Selling',
    tone: 'Persuasif & Soft-Selling — Tunjukkan masalah yang dialami audiens, tawarkan solusi secara halus, akhiri dengan CTA yang natural tanpa terasa memaksa.',
  },
]

/**
 * Full auto pipeline dari hasil riset:
 * → 3 variasi konten (Edukatif, Storytelling, Soft-Selling)
 * → Generate AI → Evaluasi AI Critic → Status final
 * → Langsung masuk Studio Konten tanpa langkah manual
 */
export async function generateContentFromResearch(
  businessId: string,
  researchTitle: string,
  researchContent: string
) {
  const supabase = await createClient()
  const results: { label: string; score: number; status: string }[] = []

  for (const variation of CONTENT_VARIATIONS) {
    try {
      const brief = `
Hasil Riset: "${researchTitle}"

Konteks Riset:
${researchContent}

Buat konten media sosial yang menarik berdasarkan hasil riset di atas.
Angle konten: ${variation.tone}
      `.trim()

      // 1. Generate konten
      const aiResult = await runCopywriter(businessId, brief, variation.tone)

      // 2. Evaluasi dengan AI Critic
      const contentText = `Hook: ${aiResult.hook}\nBody: ${aiResult.body}\nCTA: ${aiResult.cta}`
      const review = await runContentCritic(businessId, contentText)
      const finalStatus = review.score >= 75 ? 'approved_recommended' : 'needs_improvement'

      // 3. Simpan langsung ke contents (skip draft)
      const title = `[${variation.label}] ${researchTitle}`
      await supabase.from('contents').insert({
        business_id: businessId,
        title,
        hook: aiResult.hook,
        body: aiResult.body,
        cta: aiResult.cta,
        hashtags: aiResult.hashtags,
        status: finalStatus,
        ai_score: review.score,
        ai_feedback: review.feedback,
        ai_claim_warnings: review.claim_warnings,
      })

      results.push({ label: variation.label, score: review.score, status: finalStatus })
    } catch (err: unknown) {
      // Lanjutkan variasi lain jika satu gagal
      console.error(`Variasi ${variation.label} gagal:`, getErrorMessage(err))
    }
  }

  if (results.length === 0) {
    throw new Error('Semua variasi konten gagal dibuat. Coba lagi.')
  }

  revalidatePath(`/dashboard/${businessId}/contents`)
  return { success: true, results }
}

export async function deleteResearchItem(businessId: string, itemId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('research_items')
    .delete()
    .eq('id', itemId)
    .eq('business_id', businessId)
  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${businessId}/research`)
  return { success: true }
}

'use server'

import { revalidatePath } from 'next/cache'
import { scheduleToBuffer, deleteFromBuffer } from '@/lib/integrations/buffer'
import { requireBusinessMembership, assertResourceInBusiness, assertPlatform } from '@/lib/auth/business-access'

export async function scheduleContent(businessId: string, contentId: string, scheduledAt: string, platform: string) {
  const { supabase } = await requireBusinessMembership(businessId)
  await assertResourceInBusiness(supabase, 'contents', contentId, businessId)
  assertPlatform(platform)
  const parsedDate = new Date(scheduledAt)
  if (Number.isNaN(parsedDate.getTime()) || parsedDate.getTime() <= Date.now()) throw new Error('Waktu jadwal tidak valid.')

  try {
    // Ambil data konten
    const { data: content, error: fetchError } = await supabase
      .from('contents')
      .select('hook, body, cta, hashtags')
      .eq('id', contentId)
      .eq('business_id', businessId)
      .single()

    if (fetchError || !content) throw new Error("Gagal mengambil data konten")

    // Format teks untuk dipublikasikan
    const tags = content.hashtags && content.hashtags.length > 0 
      ? `\n\n${content.hashtags.map((t: string) => `#${t}`).join(' ')}` 
      : ''
    
    const textToPublish = `${content.hook}\n\n${content.body}\n\n${content.cta}${tags}`

    // Jadwalkan via Buffer API
    const bufferResult = await scheduleToBuffer(textToPublish, platform, scheduledAt)

    if (!bufferResult.success) {
      throw new Error(bufferResult.error || "Gagal menjadwalkan ke Buffer")
    }

    const { error } = await supabase.from('contents').update({
      scheduled_at: scheduledAt,
      platform: platform,
      status: 'scheduled',
      buffer_update_id: bufferResult.external_id
    }).eq('id', contentId).eq('business_id', businessId)

    if (error) throw new Error(error.message)

    revalidatePath(`/dashboard/${businessId}/calendar`)
    revalidatePath(`/dashboard/${businessId}/contents`)
    return { success: true }
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export async function unscheduleContent(businessId: string, contentId: string) {
  const { supabase } = await requireBusinessMembership(businessId)
  await assertResourceInBusiness(supabase, 'contents', contentId, businessId)

  try {
    // Ambil data konten untuk mendapatkan buffer_update_id
    const { data: content, error: fetchError } = await supabase
      .from('contents')
      .select('buffer_update_id')
      .eq('id', contentId)
      .eq('business_id', businessId)
      .single()

    if (fetchError) throw new Error("Gagal mengambil data konten")

    // Hapus jadwal di Buffer jika ada
    if (content?.buffer_update_id) {
      await deleteFromBuffer(content.buffer_update_id)
    }

    const { error } = await supabase.from('contents').update({
      scheduled_at: null,
      platform: null,
      status: 'approved_recommended',
      buffer_update_id: null
    }).eq('id', contentId).eq('business_id', businessId)

    if (error) throw new Error(error.message)

    revalidatePath(`/dashboard/${businessId}/calendar`)
    revalidatePath(`/dashboard/${businessId}/contents`)
    return { success: true }
  } catch (error: any) {
    throw new Error(error.message)
  }
}

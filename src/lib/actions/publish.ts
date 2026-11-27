'use server'

import { requireBusinessMembership } from '@/lib/auth/business-access'
import { revalidatePath } from 'next/cache'
import { publishToBuffer } from '@/lib/integrations/buffer'
import { getErrorMessage } from '@/lib/utils'

export async function publishContentNow(businessId: string, contentId: string) {
  const { supabase } = await requireBusinessMembership(businessId)

  try {
    // 1. Ambil data konten
    const { data: content, error: fetchError } = await supabase
      .from('contents')
      .select('title, body, platform, business_id')
      .eq('id', contentId)
      .eq('business_id', businessId)
      .single()
    if (fetchError || !content) throw new Error("Gagal mengambil data konten")
    
    // 2. Format teks untuk dipublikasikan
    const publishText = `${content.title}\n\n${content.body}`
    
    // 3. Panggil integrasi Buffer
    const result = await publishToBuffer(publishText, content.platform || 'General')
    
    if (!result.success) {
      // Catat kegagalan
      await supabase.from('contents').update({
        publish_error: result.error
      }).eq('id', contentId).eq('business_id', businessId)
      
      throw new Error(`Publikasi gagal: ${result.error}`)
    }

    // 4. Update status ke 'published'
    const { error: updateError } = await supabase.from('contents').update({
      status: 'published',
      external_publish_id: result.external_id,
      publish_error: null
    }).eq('id', contentId).eq('business_id', businessId)

    if (updateError) throw new Error(updateError.message)
      
    revalidatePath(`/dashboard/${businessId}/calendar`)
    revalidatePath(`/dashboard/${businessId}/contents`)
    return { success: true }
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error))
  }
}

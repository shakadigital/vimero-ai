'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { publishToBuffer } from '@/lib/integrations/buffer'

export async function publishContentNow(businessId: string, contentId: string) {
  const supabase = await createClient()

  try {
    // 1. Ambil data konten
    const { data: content, error: fetchError } = await supabase.from('contents').select('title, body, platform').eq('id', contentId).single()
    if (fetchError || !content) throw new Error("Gagal mengambil data konten")
    
    // 2. Format teks untuk dipublikasikan
    const publishText = `${content.title}\n\n${content.body}`
    
    // 3. Panggil integrasi Buffer
    const result = await publishToBuffer(publishText, content.platform || 'General')
    
    if (!result.success) {
      // Catat kegagalan
      await supabase.from('contents').update({
        publish_error: result.error
      }).eq('id', contentId)
      
      throw new Error(`Publikasi gagal: ${result.error}`)
    }

    // 4. Update status ke 'published'
    const { error: updateError } = await supabase.from('contents').update({
      status: 'published',
      external_publish_id: result.external_id,
      publish_error: null
    }).eq('id', contentId)

    if (updateError) throw new Error(updateError.message)
      
    revalidatePath(`/dashboard/${businessId}/calendar`)
    revalidatePath(`/dashboard/${businessId}/contents`)
    return { success: true }
  } catch (error: any) {
    throw new Error(error.message)
  }
}

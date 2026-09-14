'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { generateVoiceoverEdgeTTS } from '@/lib/ai/audio-router'
import { assertResourceInBusiness, requireBusinessMembership } from '@/lib/auth/business-access'
import { revalidatePath } from 'next/cache'

export async function generateAudioAction(
  businessId: string, 
  contentId: string, 
  text: string, 
  voicePersona: string
) {
  const { supabase } = await requireBusinessMembership(businessId)
  await assertResourceInBusiness(supabase, 'contents', contentId, businessId)
  const adminClient = createAdminClient()

  try {
    // 2. Generate Audio via Edge TTS
    const { audioBuffer, subtitles } = await generateVoiceoverEdgeTTS(text, voicePersona)
    
    // 3. Upload ke Supabase Storage (bucket: 'media')
    // Storage policy expects the business ID in the first path segment.
    const fileName = `${businessId}/audio/${contentId}-${Date.now()}.mp3`
    
    const { error: uploadError } = await supabase
      .storage
      .from('media')
      .upload(fileName, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: false
      })
      
    if (uploadError) throw uploadError
    
    // The media bucket is private, so return a temporary URL for playback/rendering.
    const { data: signedUrlData, error: signedUrlError } = await adminClient
      .storage
      .from('media')
      .createSignedUrl(fileName, 60 * 60)

    if (signedUrlError || !signedUrlData?.signedUrl) {
      throw signedUrlError || new Error('Gagal membuat URL audio')
    }
      
    // 4. Update tabel contents
    const { error: updateError } = await supabase
      .from('contents')
      .update({
        audio_url: signedUrlData.signedUrl,
        voice_persona: voicePersona,
        subtitle_data: subtitles
      })
      .eq('id', contentId)
      
    if (updateError) throw updateError
    
    revalidatePath(`/dashboard/${businessId}/video`)
    
    return { success: true, audioUrl: signedUrlData.signedUrl, subtitles }
  } catch (error: unknown) {
    console.error("Audio generation error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate audio",
    }
  }
}

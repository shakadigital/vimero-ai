'use server'

import { createClient } from '@/lib/supabase/server'
import { generateVoiceoverEdgeTTS } from '@/lib/ai/audio-router'
import { revalidatePath } from 'next/cache'

export async function generateAudioAction(
  businessId: string, 
  contentId: string, 
  text: string, 
  voicePersona: string
) {
  const supabase = await createClient()

  // 1. Validasi user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  try {
    // 2. Generate Audio via Edge TTS
    const { audioBuffer, subtitles } = await generateVoiceoverEdgeTTS(text, voicePersona)
    
    // 3. Upload ke Supabase Storage (bucket: 'media')
    const fileName = `audio/${businessId}/${contentId}-${Date.now()}.mp3`
    
    const { error: uploadError } = await supabase
      .storage
      .from('media')
      .upload(fileName, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true
      })
      
    if (uploadError) throw uploadError
    
    // Dapatkan Public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('media')
      .getPublicUrl(fileName)
      
    // 4. Update tabel contents
    const { error: updateError } = await supabase
      .from('contents')
      .update({
        audio_url: publicUrl,
        voice_persona: voicePersona,
        subtitle_data: subtitles
      })
      .eq('id', contentId)
      
    if (updateError) throw updateError
    
    revalidatePath(`/dashboard/${businessId}/video`)
    
    return { success: true, audioUrl: publicUrl, subtitles }
  } catch (error: any) {
    console.error("Audio generation error:", error)
    return { success: false, error: error.message || "Failed to generate audio" }
  }
}

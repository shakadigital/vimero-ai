'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateBrandKit(formData: FormData) {
  const supabase = await createClient()
  
  const business_id = formData.get('business_id') as string
  const primary_color = formData.get('primary_color') as string
  const tone_of_voice = formData.get('tone_of_voice') as string
  const brand_personality = formData.get('brand_personality') as string
  const target_audience = formData.get('target_audience') as string
  const audience_problems = formData.get('audience_problems') as string
  const writing_style = formData.get('writing_style') as string
  
  // Parse comma separated strings into arrays
  const parseArray = (str: string) => str ? str.split(',').map(s => s.trim()).filter(Boolean) : []
  const preferred_words = parseArray(formData.get('preferred_words') as string)
  const forbidden_words = parseArray(formData.get('forbidden_words') as string)
  const forbidden_phrases = parseArray(formData.get('forbidden_phrases') as string)
  const content_boundaries = parseArray(formData.get('content_boundaries') as string)

  if (!business_id) throw new Error('Business ID missing')

  const { error } = await supabase
    .from('brand_kits')
    .upsert({
      business_id,
      primary_color,
      tone_of_voice,
      brand_personality,
      target_audience,
      audience_problems,
      writing_style,
      preferred_words,
      forbidden_words,
      forbidden_phrases,
      content_boundaries
    }, { onConflict: 'business_id' })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(`/dashboard/${business_id}/settings/brand-kit`)
}

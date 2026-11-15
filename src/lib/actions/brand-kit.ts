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

  // Parse newline or semicolon separated arrays for longer sentences
  const parseLines = (str: string) =>
    str ? str.split(/\r?\n/).map(s => s.trim()).filter(Boolean) : []

  const proof_points = parseLines(formData.get('proof_points') as string)
  const brand_positions = parseLines(formData.get('brand_positions') as string)
  const default_search_terms = parseArray(formData.get('default_search_terms') as string).slice(0, 4)
  const default_hashtags = parseArray(formData.get('default_hashtags') as string).map((tag) =>
    '#' + tag.replace(/^#+/, '').replace(/[^A-Za-z0-9_]/g, '')
  ).filter((tag) => tag.length > 1)

  const rawWpm = parseInt((formData.get('speaking_wpm') as string) || '165', 10)
  const speaking_wpm = Number.isFinite(rawWpm) ? Math.max(100, Math.min(250, rawWpm)) : 165
  const pronouns = ((formData.get('pronouns') as string) || '').trim() || null
  const cta_keyword = ((formData.get('cta_keyword') as string) || '')
    .replace(/[^A-Za-z0-9]/g, '')
    .toUpperCase() || null
  const cta_delivers = ((formData.get('cta_delivers') as string) || '').trim() || null

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
      content_boundaries,
      proof_points,
      brand_positions,
      default_search_terms,
      default_hashtags,
      speaking_wpm,
      pronouns,
      cta_keyword,
      cta_delivers,
    }, { onConflict: 'business_id' })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(`/dashboard/${business_id}/settings/brand-kit`)
}

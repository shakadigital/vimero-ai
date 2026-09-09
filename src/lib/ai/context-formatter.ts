import { createClient } from '@/lib/supabase/server'

export async function getBrandMemoryContext(businessId: string): Promise<string> {
  const supabase = await createClient()

  const [businessRes, brandKitRes] = await Promise.all([
    supabase.from('businesses').select('*').eq('id', businessId).single(),
    supabase.from('brand_kits').select('*').eq('business_id', businessId).single()
  ])

  const business = businessRes.data
  const brandKit = brandKitRes.data

  if (!business) return ''

  let context = `
=== BRAND MEMORY CONTEXT ===
You must strictly adhere to the following business and brand guidelines when generating or evaluating content:

1. BRAND IDENTITY
- Brand Name: ${business.name}
- Industry: ${business.industry || 'Not specified'}
- Description: ${business.description || 'Not specified'}

2. TARGET AUDIENCE
- Target Audience: ${brandKit?.target_audience || 'General public'}
- Audience Problems: ${brandKit?.audience_problems || 'Not specified'}

3. BRAND VOICE
- Tone of Voice: ${brandKit?.tone_of_voice || 'Professional and engaging'}
- Brand Personality: ${brandKit?.brand_personality || 'Not specified'}
- Writing Style: ${brandKit?.writing_style || 'Not specified'}
`

  if (brandKit?.preferred_words && brandKit.preferred_words.length > 0) {
    context += `
4. PREFERRED WORDS
Use these words when appropriate:
- ${brandKit.preferred_words.join(', ')}
`
  }

  if (brandKit?.forbidden_words && brandKit.forbidden_words.length > 0) {
    context += `
5. FORBIDDEN WORDS
CRITICAL RULE: DO NOT USE THESE WORDS UNDER ANY CIRCUMSTANCES:
- ${brandKit.forbidden_words.join(', ')}
`
  }

  if (brandKit?.forbidden_phrases && brandKit.forbidden_phrases.length > 0) {
    context += `
6. FORBIDDEN PHRASES
CRITICAL RULE: DO NOT USE THESE PHRASES UNDER ANY CIRCUMSTANCES:
- ${brandKit.forbidden_phrases.join(', ')}
`
  }

  if (brandKit?.content_boundaries && brandKit.content_boundaries.length > 0) {
    context += `
7. CONTENT BOUNDARIES
CRITICAL RULE: Adhere strictly to these boundaries:
- ${brandKit.content_boundaries.join('\n- ')}
`
  }

  context += `============================\n\n`

  return context
}

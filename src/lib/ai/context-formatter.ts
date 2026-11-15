import { createClient } from '@/lib/supabase/server'

export interface BrandVoiceConfig {
  businessName: string
  industry: string
  description: string
  targetAudience: string
  audienceProblems: string
  toneOfVoice: string
  brandPersonality: string
  writingStyle: string
  pronouns: string
  speakingWpm: number
  preferredWords: string[]
  forbiddenWords: string[]
  forbiddenPhrases: string[]
  contentBoundaries: string[]
  proofPoints: string[]
  brandPositions: string[]
  defaultSearchTerms: string[]
  defaultHashtags: string[]
  ctaKeyword: string
  ctaDelivers: string
}

export async function getBrandVoiceConfig(businessId: string): Promise<BrandVoiceConfig | null> {
  const supabase = await createClient()

  const [businessRes, brandKitRes] = await Promise.all([
    supabase.from('businesses').select('*').eq('id', businessId).single(),
    supabase.from('brand_kits').select('*').eq('business_id', businessId).single()
  ])

  const business = businessRes.data
  const brandKit = brandKitRes.data

  if (!business) return null

  return {
    businessName: business.name,
    industry: business.industry || 'Not specified',
    description: business.description || 'Not specified',
    targetAudience: brandKit?.target_audience || 'General public',
    audienceProblems: brandKit?.audience_problems || 'Not specified',
    toneOfVoice: brandKit?.tone_of_voice || 'Professional and engaging',
    brandPersonality: brandKit?.brand_personality || 'Not specified',
    writingStyle: brandKit?.writing_style || 'Not specified',
    pronouns: brandKit?.pronouns || 'aku-kamu',
    speakingWpm: brandKit?.speaking_wpm || 165,
    preferredWords: brandKit?.preferred_words || [],
    forbiddenWords: brandKit?.forbidden_words || [],
    forbiddenPhrases: brandKit?.forbidden_phrases || [],
    contentBoundaries: brandKit?.content_boundaries || [],
    proofPoints: brandKit?.proof_points || [],
    brandPositions: brandKit?.brand_positions || [],
    defaultSearchTerms: brandKit?.default_search_terms || [],
    defaultHashtags: brandKit?.default_hashtags || [],
    ctaKeyword: brandKit?.cta_keyword || '',
    ctaDelivers: brandKit?.cta_delivers || '',
  }
}

export async function getBrandMemoryContext(businessId: string): Promise<string> {
  const config = await getBrandVoiceConfig(businessId)
  if (!config) return ''

  let context = `
=== BRAND MEMORY CONTEXT ===
You must strictly adhere to the following business and brand guidelines when generating or evaluating content:

1. BRAND IDENTITY
- Brand Name: ${config.businessName}
- Industry: ${config.industry}
- Description: ${config.description}

2. TARGET AUDIENCE
- Target Audience: ${config.targetAudience}
- Audience Problems: ${config.audienceProblems}

3. BRAND VOICE
- Tone of Voice: ${config.toneOfVoice}
- Brand Personality: ${config.brandPersonality}
- Writing Style: ${config.writingStyle}
- Pronouns: ${config.pronouns}
`

  if (config.preferredWords.length > 0) {
    context += `
4. PREFERRED WORDS
Use these words when appropriate:
- ${config.preferredWords.join(', ')}
`
  }

  if (config.forbiddenWords.length > 0) {
    context += `
5. FORBIDDEN WORDS
CRITICAL RULE: DO NOT USE THESE WORDS UNDER ANY CIRCUMSTANCES:
- ${config.forbiddenWords.join(', ')}
`
  }

  if (config.forbiddenPhrases.length > 0) {
    context += `
6. FORBIDDEN PHRASES
CRITICAL RULE: DO NOT USE THESE PHRASES UNDER ANY CIRCUMSTANCES:
- ${config.forbiddenPhrases.join(', ')}
`
  }

  if (config.contentBoundaries.length > 0) {
    context += `
7. CONTENT BOUNDARIES
CRITICAL RULE: Adhere strictly to these boundaries:
- ${config.contentBoundaries.join('\n- ')}
`
  }

  if (config.proofPoints.length > 0) {
    context += `
8. REAL PROOF & FACTS ALLOWED
Use ONLY these real facts/numbers when citing proof. Never fabricate metrics; if a number is missing, write {{angka kamu}}:
- ${config.proofPoints.join('\n- ')}
`
  }

  if (config.brandPositions.length > 0) {
    context += `
9. BRAND POSITIONS (POINT OF VIEW)
Shape the angle using these core opinions without inventing new claims:
- ${config.brandPositions.join('\n- ')}
`
  }

  if (config.defaultSearchTerms.length > 0 || config.defaultHashtags.length > 0 || config.ctaKeyword) {
    context += `
10. DISTRIBUTION & CTA DEFAULTS
${config.defaultSearchTerms.length > 0 ? `- Search Terms: ${config.defaultSearchTerms.join(', ')}\n` : ''}${config.defaultHashtags.length > 0 ? `- Default Hashtags: ${config.defaultHashtags.join(' ')}\n` : ''}${config.ctaKeyword ? `- Default CTA Keyword: ${config.ctaKeyword}${config.ctaDelivers ? ` (delivers: ${config.ctaDelivers})` : ''}\n` : ''}`
  }

  context += `============================\n\n`

  return context
}

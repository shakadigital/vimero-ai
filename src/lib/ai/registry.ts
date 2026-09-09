import { generateStructuredData, RouterOptions } from './router'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export type AgentType = 'BUSINESS_STRATEGIST' | 'COPYWRITER'

export async function callAgent<T>({
  agentType,
  businessId,
  system,
  prompt,
  schema,
  options
}: {
  agentType: AgentType
  businessId: string
  system: string
  prompt: string
  schema: z.ZodSchema<T>
  options?: RouterOptions
}) {
  // Panggil router untuk eksekusi multi-provider dan validasi Zod
  const { data, usage } = await generateStructuredData({ system, prompt, schema, options })
  
  // Log penggunaan secara asinkron agar tidak memblokir antarmuka pengguna (non-blocking)
  const supabase = await createClient()
  supabase.from('ai_usage').insert({
    business_id: businessId,
    provider: usage.provider,
    model: usage.model,
    agent_type: agentType,
    prompt_tokens: usage.promptTokens,
    completion_tokens: usage.completionTokens,
    total_tokens: usage.totalTokens,
  }).then(({ error }) => {
    if (error) {
      console.error('Failed to log AI usage to Supabase:', error)
    }
  })

  return data
}

import { generateStructuredData, RouterOptions } from './router'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export type AgentType = 'BUSINESS_STRATEGIST' | 'COPYWRITER'

// Satu alur konten bisa memanggil beberapa agent, jadi batas dibuat longgar secara default.
const DEFAULT_AI_DAILY_LIMIT = 300

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
  const supabase = await createClient()

  // Kuota harian per bisnis (dihitung dari ai_usage). Versi sederhana: cek-lalu-tulis,
  // cukup untuk pemakaian pribadi. Atur batas lewat env AI_DAILY_LIMIT.
  const dailyLimit = Number(process.env.AI_DAILY_LIMIT ?? DEFAULT_AI_DAILY_LIMIT)
  const since = new Date()
  since.setUTCHours(0, 0, 0, 0)
  const { count, error: countError } = await supabase
    .from('ai_usage')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .gte('created_at', since.toISOString())
  if (countError) console.error('Failed to read AI usage quota:', countError)
  if ((count ?? 0) >= dailyLimit) {
    throw new Error('Batas penggunaan AI harian tercapai. Coba lagi besok.')
  }

  // Panggil router untuk eksekusi multi-provider dan validasi Zod
  const { data, usage } = await generateStructuredData({ system, prompt, schema, options })

  // Di-await: pada serverless, promise yang belum selesai bisa terputus saat respons dikirim.
  const { error: usageError } = await supabase.from('ai_usage').insert({
    business_id: businessId,
    provider: usage.provider,
    model: usage.model,
    agent_type: agentType,
    prompt_tokens: usage.promptTokens,
    completion_tokens: usage.completionTokens,
    total_tokens: usage.totalTokens,
  })
  if (usageError) console.error('Failed to log AI usage to Supabase:', usageError)

  return data
}

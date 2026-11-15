import { generateObject, type LanguageModel } from 'ai'
import { z } from 'zod'
import { googleProvider } from './adapters/gemini'
import { groqProvider } from './adapters/groq'

export type ProviderType = 'gemini' | 'groq'

export interface RouterOptions {
  provider?: ProviderType
  model?: string
  maxTokens?: number
}

export async function generateStructuredData<T>({
  system,
  prompt,
  schema,
  options,
}: {
  system: string
  prompt: string
  schema: z.ZodSchema<T>
  options?: RouterOptions
}) {
  let aiModel: LanguageModel
  const providerType = options?.provider || 'gemini'

  // Resolusi model
  if (providerType === 'groq') {
    aiModel = groqProvider(options?.model || 'qwen/qwen3.6-27b')
  } else {
    // Default to Gemini (3.6 Flash) - sangat cepat dan stabil
    aiModel = googleProvider(options?.model || 'gemini-3.6-flash')
  }

  try {
    const { object, usage } = await generateObject({
      model: aiModel,
      system,
      prompt,
      schema,
      // Batasi 400 token hanya untuk Groq agar tidak terkena limit 1000 output tokens
      maxTokens: options?.maxTokens ?? (providerType === 'groq' ? 400 : 2048),
    })

    return { 
      data: object, 
      usage: {
        provider: providerType,
        model: aiModel.modelId,
        promptTokens: usage.inputTokens || 0,
        completionTokens: usage.outputTokens || 0,
        totalTokens: usage.totalTokens || 0
      }
    }
  } catch (error) {
    console.error(`AI Router Error (${providerType}):`, error)
    
    // Fallback otomatis ke Groq jika Gemini gagal (dan kita belum ada di state fallback)
    if (providerType === 'gemini') {
      console.log('Mengaktifkan Fallback ke Groq (qwen/qwen3.6-27b)...')
      return generateStructuredData({
        system,
        prompt,
        schema,
        options: { provider: 'groq', model: 'qwen/qwen3.6-27b' }
      })
    }
    
    // Lempar eror jika gagal di semua provider
    throw error
  }
}

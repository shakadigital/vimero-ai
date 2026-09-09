import { createOpenAI } from '@ai-sdk/openai'

export const groqProvider = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY || '',
})

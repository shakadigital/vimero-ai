import { createGoogleGenerativeAI } from '@ai-sdk/google'

export const googleProvider = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || '',
})

import { z } from 'zod'
import { callAgent } from '../registry'
import { getBrandMemoryContext } from '../context-formatter'

export const CriticOutputSchema = z.object({
  score: z.number().min(0).max(100).describe("Overall quality score out of 100"),
  feedback: z.string().describe("Detailed feedback and suggestions for improvement"),
  claim_warnings: z.array(z.string()).describe("List of potential over-claims, sensitive topics, or risky statements found in the text. Empty if safe.")
})

export type CriticOutput = z.infer<typeof CriticOutputSchema>

export async function runContentCritic(businessId: string, contentText: string): Promise<CriticOutput> {
  const brandMemory = await getBrandMemoryContext(businessId)

  const system = `${brandMemory}
You are a strict, senior Content Editor and AI Critic.
Your job is to review the drafted content based on engagement potential, clarity, safety, and STRICT compliance with the Brand Memory rules above.
If the content violates ANY Forbidden Words, Forbidden Phrases, or Content Boundaries, you MUST:
1. Mark it as a violation in the feedback.
2. Reduce the score significantly (always score below 85 if there are critical rule violations).
3. Extract the violations as claim_warnings.
Provide a quality score (0-100), actionable feedback, and extract any dangerous/over-promising claims or rule violations as warnings.
Use Indonesian language.`

  const prompt = `Review this content:\n${contentText}`

  return callAgent({
    agentType: 'BUSINESS_STRATEGIST', // Menggunakan kuota Strategist sementara karena fungsinya analitis
    businessId,
    system,
    prompt,
    schema: CriticOutputSchema,
  })
}

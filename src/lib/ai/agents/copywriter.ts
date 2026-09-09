import { z } from 'zod'
import { callAgent } from '../registry'
import { getBrandMemoryContext } from '../context-formatter'

export const CopywriterOutputSchema = z.object({
  hook: z.string().describe("Catchy opening sentence or phrase to grab attention"),
  body: z.string().describe("Main body of the promotional content"),
  cta: z.string().describe("Clear and persuasive Call to Action text"),
  hashtags: z.array(z.string()).describe("List of relevant hashtags")
})

export type CopywriterOutput = z.infer<typeof CopywriterOutputSchema>

export async function runCopywriter(businessId: string, brief: string, defaultToneOfVoice: string): Promise<CopywriterOutput> {
  const brandMemory = await getBrandMemoryContext(businessId)

  const system = `${brandMemory}
You are a world-class Copywriter AI.
Write engaging marketing copy based on the user's brief. 
Adhere strictly to the requested Tone of Voice (from Brand Memory if available, otherwise: "${defaultToneOfVoice}").
Ensure NO forbidden words or phrases are used. Ensure ALL content boundaries are respected.
Structure the output into a Hook, Body, CTA, and Hashtags. Use Indonesian language.
For the hashtags array, provide 3-5 relevant words WITHOUT the '#' symbol and WITHOUT any punctuation or '&' signs.`

  return callAgent({
    agentType: 'COPYWRITER',
    businessId,
    system,
    prompt: brief,
    schema: CopywriterOutputSchema,
  })
}

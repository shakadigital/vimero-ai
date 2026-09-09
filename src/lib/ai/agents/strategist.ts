import { z } from 'zod'
import { callAgent } from '../registry'

export const StrategistOutputSchema = z.object({
  analysis: z.string().describe("Executive summary of the business strategy and market position"),
  target_audience: z.array(z.string()).describe("List of target audience profiles or personas"),
  swot: z.object({
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    opportunities: z.array(z.string()),
    threats: z.array(z.string()),
  }).describe("SWOT Analysis matrix")
})

export type StrategistOutput = z.infer<typeof StrategistOutputSchema>

export async function runBusinessStrategist(businessId: string, context: string): Promise<StrategistOutput> {
  const system = `You are a world-class Business Strategist AI. 
Analyze the provided business context and output a highly structured strategy including SWOT and target audience. 
Be concise, professional, and insightful. Use Indonesian language.`
  
  return callAgent({
    agentType: 'BUSINESS_STRATEGIST',
    businessId,
    system,
    prompt: context,
    schema: StrategistOutputSchema,
  })
}

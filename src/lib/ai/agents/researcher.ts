import { z } from 'zod'
import { callAgent } from '../registry'
import { getBrandMemoryContext } from '../context-formatter'

export const ResearcherOutputSchema = z.object({
  items: z.array(z.object({
    title: z.string().describe("Judul temuan riset (misal: 'Trend Video Edukasi Pendek')"),
    content: z.string().describe("Detail temuan, mengapa penting, dan sudut pandang (angle) konten yang disarankan.")
  })).describe("Daftar hasil riset yang ditemukan.")
})

export type ResearcherOutput = z.infer<typeof ResearcherOutputSchema>

export async function runResearcher(businessId: string, researchType: 'trend' | 'competitor' | 'audience' | 'keyword'): Promise<ResearcherOutput> {
  const brandMemory = await getBrandMemoryContext(businessId)

  let focusArea = ''
  switch (researchType) {
    case 'trend':
      focusArea = "Fokus pada tren konten terkini, format viral, dan topik hangat di industri ini."
      break
    case 'competitor':
      focusArea = "Fokus pada apa yang mungkin sedang dilakukan kompetitor, celah kelemahan mereka, dan peluang yang belum tergarap."
      break
    case 'audience':
      focusArea = "Fokus pada masalah terdalam audiens (pain points), pertanyaan yang sering diajukan, dan keinginan terpendam mereka."
      break
    case 'keyword':
      focusArea = "Fokus pada kata kunci pencarian bervolume tinggi, hashtag populer, dan frasa SEO yang relevan."
      break
  }

  const system = `${brandMemory}
You are an elite Business Researcher and Market Analyst AI.
Your job is to provide highly actionable research insights based on the provided business profile.
Since you don't have real-time internet access for this POC, use your extensive training data to simulate the most likely current market conditions, evergreen trends, and universal pain points for this specific industry.
${focusArea}
Provide exactly 3 to 5 highly detailed and actionable research items.
Respond in Indonesian.`

  const prompt = `Lakukan riset untuk kategori: ${researchType.toUpperCase()}. Hasilkan 3-5 temuan yang bisa langsung dijadikan ide konten.`

  // Menggunakan STRATEGIST karena fungsinya analitis dan butuh pemahaman mendalam
  return callAgent({
    agentType: 'BUSINESS_STRATEGIST',
    businessId,
    system,
    prompt,
    schema: ResearcherOutputSchema,
  })
}

import { z } from 'zod'
import { callAgent } from '../registry'
import { getBrandMemoryContext, getBrandVoiceConfig } from '../context-formatter'
import {
  analyzeBeats,
  HOOK_FORMULAS,
  humanizeText,
  lintCaption,
  scoreHook,
  type BeatAnalysisResult,
  type HookScoreResult,
} from '../quality'

export const CopywriterOutputSchema = z.object({
  hook: z.string().describe('Catchy opening sentence or phrase to grab attention'),
  body: z.string().describe('Main body of the promotional content'),
  cta: z.string().describe('Clear and persuasive Call to Action text'),
  hashtags: z.array(z.string()).describe('List of relevant hashtags'),
})

export type CopywriterOutput = z.infer<typeof CopywriterOutputSchema>

export const ReelHooksOutputSchema = z.object({
  hooks: z
    .array(
      z.object({
        formula_id: z.number(),
        formula: z.string(),
        spoken: z.string().describe('Spoken hook, 5 to 8 words max'),
        on_screen: z.string().describe('Short on-screen text card, max 6 words'),
      })
    )
    .min(1)
    .max(3),
})

export const ReelBeatsOutputSchema = z.object({
  beats: z.array(
    z.object({
      line: z.string().describe('Spoken line for this beat, max 11 words'),
      shot: z.string().describe('Camera or screen action for this beat'),
      on_screen: z.string().describe('On-screen card text (max 6 words) or empty string'),
    })
  ),
})

export interface ReelScriptResult {
  hook: {
    formula_id: number
    formula: string
    spoken: string
    on_screen: string
    score: HookScoreResult
  }
  beats: Array<{
    line: string
    shot: string
    on_screen: string
  }>
  analysis: BeatAnalysisResult | null
  scriptText: string
}

function buildCaptionPreview(output: CopywriterOutput): string {
  const tags = output.hashtags
    .map((h) => (h.startsWith('#') ? h.trim() : `#${h.trim()}`))
    .filter((h) => h.length > 1)
    .join(' ')
  return [output.hook, output.body, output.cta, tags].filter(Boolean).join('\n\n')
}

export async function runCopywriter(
  businessId: string,
  brief: string,
  defaultToneOfVoice: string
): Promise<CopywriterOutput> {
  const [brandMemory, voiceConfig] = await Promise.all([
    getBrandMemoryContext(businessId),
    getBrandVoiceConfig(businessId),
  ])

  const searchTerms = voiceConfig?.defaultSearchTerms ?? []
  const hasDeliverableCta = Boolean(voiceConfig?.ctaKeyword)

  const system = `${brandMemory}
You are a world-class Copywriter AI.
Write engaging marketing copy based on the user's brief.
Adhere strictly to the requested Tone of Voice (from Brand Memory if available, otherwise: "${defaultToneOfVoice}").
Ensure NO forbidden words or phrases are used. Ensure ALL content boundaries are respected.
RULES:
- First line (hook) must be under 125 characters, concrete, never start with a greeting, hashtag, or emoji.
- Use ONLY real proof/numbers from Brand Memory or the brief. If a metric is missing, write {{angka kamu}} instead of inventing numbers.
- Include at most ONE clear Call to Action (CTA).
- No links/URLs inside the body, no em dashes, no filler hashtags (#fyp, #viral, #trending).
- Structure the output into Hook, Body, CTA, and 3-5 relevant Hashtags (WITHOUT '#' symbol). Use Indonesian language.${searchTerms.length > 0 ? `\n- Naturally weave these search terms into body sentences: ${searchTerms.join(', ')}.` : ''}`

  let currentBrief = brief
  let latestOutput: CopywriterOutput | null = null

  for (let attempt = 0; attempt < 2; attempt++) {
    const raw = await callAgent({
      agentType: 'COPYWRITER',
      businessId,
      system,
      prompt: currentBrief,
      schema: CopywriterOutputSchema,
    })

    const humanized: CopywriterOutput = {
      hook: humanizeText(raw.hook, { lexical: false }).text,
      body: humanizeText(raw.body, { lexical: false }).text,
      cta: humanizeText(raw.cta, { lexical: false }).text,
      hashtags: raw.hashtags
        .map((tag) => tag.replace(/^#+/, '').replace(/[^A-Za-z0-9_]/g, '').trim())
        .filter(Boolean)
        .slice(0, 5),
    }

    latestOutput = humanized
    const fullCaption = buildCaptionPreview(humanized)
    const lint = lintCaption(fullCaption, {
      truncateAt: 125,
      keywords: searchTerms,
      job: 'B',
      maxHashtags: 5,
      hasDeliverableCta,
    })

    if (lint.blocking.length === 0 || attempt === 1) {
      return humanized
    }

    const feedback = lint.blocking.map((c) => `- ${c.check}: ${c.detail}`).join('\n')
    currentBrief = `${brief}\n\nPrevious draft failed quality checks. Fix every item and rewrite:\n${feedback}`
  }

  return latestOutput!
}

/**
 * Menghasilkan hook terbaik (dari 26 formula + Hook Scorer) dan beat sheet berwaktu untuk Reel.
 */
export async function runReelScriptWriter(
  businessId: string,
  brief: string,
  options: { targetSeconds?: number; ctaKeyword?: string; language?: 'id' | 'en' } = {}
): Promise<ReelScriptResult> {
  const [brandMemory, voiceConfig] = await Promise.all([
    getBrandMemoryContext(businessId),
    getBrandVoiceConfig(businessId),
  ])

  const wpm = voiceConfig?.speakingWpm || 165
  const targetSeconds = Math.max(15, Math.min(60, options.targetSeconds ?? 30))
  const language = options.language ?? 'id'
  const ctaKeyword = options.ctaKeyword || voiceConfig?.ctaKeyword || ''
  const lexical = language === 'en'

  const formulasText = HOOK_FORMULAS.map(
    (f) => `#${f.id} ${f.name} | ${f.template} | trap: ${f.trap}`
  ).join('\n')

  const hookSystem = `${brandMemory}
You write Instagram Reel hooks.
Pick THREE different formulas from the list below.
For each hook:
- spoken: 5 to 8 words MAX (must be spoken under 3 seconds).
- on_screen: 6 words or fewer, blunt, no emoji, no hashtag.
- Never start with a greeting, "stop scrolling", or "di video ini".
- Never invent metrics; use {{angka kamu}} ONLY for a missing number.
- Language: ${language === 'id' ? 'Bahasa Indonesia sehari-hari (cara orang ngomong)' : 'Plain spoken English'}.

FORMULAS:
${formulasText}`

  let hookPrompt = `Brief: ${brief}\nTarget length: ${targetSeconds}s`
  let winningHook: {
    formula_id: number
    formula: string
    spoken: string
    on_screen: string
    score: HookScoreResult
  } | null = null

  for (let attempt = 0; attempt < 2; attempt++) {
    const hookRes = await callAgent({
      agentType: 'COPYWRITER',
      businessId,
      system: hookSystem,
      prompt: hookPrompt,
      schema: ReelHooksOutputSchema,
    })

    const scored = hookRes.hooks
      .map((h) => ({
        ...h,
        spoken: humanizeText(h.spoken, { lexical }).text,
        on_screen: humanizeText(h.on_screen, { lexical }).text,
        score: scoreHook(h.spoken),
      }))
      .sort((a, b) => b.score.score - a.score.score)

    const candidate = scored.find((h) => h.score.wordCount <= 8 && h.score.score >= 50) || scored[0]
    winningHook = candidate

    if ((candidate.score.score >= 50 && candidate.score.wordCount <= 8) || attempt === 1) {
      break
    }

    const feedback = scored
      .map(
        (h) =>
          `"${h.spoken}" (${h.score.wordCount} words) -> ${h.score.score} ${h.score.verdict}; weakest ${h.score.weakest}: ${h.score.checks[h.score.weakest].detail}`
      )
      .join('\n')
    hookPrompt = `${brief}\n\nPrevious hooks scored too low. Write 3 NEW hooks fixing the weakest metric:\n${feedback}`
  }

  const chosen = winningHook!
  const targetWords = Math.round((targetSeconds * wpm) / 60)
  const ctaInstruction = ctaKeyword
    ? `End with ONE ask: "Komen ${ctaKeyword}"${voiceConfig?.ctaDelivers ? ` (${voiceConfig.ctaDelivers})` : ''}.`
    : 'End with ONE ask: "simpan" or "follow". Do NOT invent a comment keyword.'

  const scriptSystem = `${brandMemory}
You write a timed Instagram Reel script (~${targetWords} spoken words at ${wpm} WPM, target ${targetSeconds}s).
- Beat 1 line MUST be verbatim: "${chosen.spoken}"
- Each beat is ONE spoken line (max 11 words).
- Last beat MUST echo at least one meaningful word from Beat 1 for a clean replay loop.
- ${ctaInstruction}
- Never invent metrics; use {{angka kamu}} ONLY for a missing number.
- Language: ${language === 'id' ? 'Bahasa Indonesia sehari-hari' : 'Plain spoken English'}.`

  let scriptPrompt = `Brief: ${brief}\nWinning hook (#${chosen.formula_id} ${chosen.formula}): ${chosen.spoken}`
  let finalBeats: Array<{ line: string; shot: string; on_screen: string }> = []
  let finalAnalysis: BeatAnalysisResult | null = null
  let finalScriptText = ''

  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await callAgent({
      agentType: 'COPYWRITER',
      businessId,
      system: scriptSystem,
      prompt: scriptPrompt,
      schema: ReelBeatsOutputSchema,
    })

    const beats = res.beats.map((b, index) => ({
      line:
        index === 0
          ? chosen.spoken
          : humanizeText(b.line, { lexical }).text.replace(/\n+/g, ' '),
      shot: b.shot.trim(),
      on_screen:
        index === 0 && !b.on_screen.trim()
          ? chosen.on_screen
          : humanizeText(b.on_screen, { lexical }).text,
    }))

    const scriptText = beats.map((b) => b.line).join('\n')
    const analysis = analyzeBeats(scriptText, { wpm, targetSeconds })

    finalBeats = beats
    finalAnalysis = analysis
    finalScriptText = scriptText

    if (!analysis || analysis.blocking.length === 0 || attempt === 1) {
      break
    }

    scriptPrompt = `${brief}\n\nPrevious script failed timing/loop checks:\n- ${analysis.blocking.join('\n- ')}\n\nPrevious lines:\n${scriptText}`
  }

  return {
    hook: chosen,
    beats: finalBeats,
    analysis: finalAnalysis,
    scriptText: finalScriptText,
  }
}

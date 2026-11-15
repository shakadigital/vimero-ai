export interface HookFormula {
  id: number
  name: string
  template: string
  example: string
  trap: string
}

export type HookCheckKey = 'LENGTH' | 'SPECIFICITY' | 'STAKES' | 'FRONTLOAD' | 'ADDRESS'

export interface HookCheckResult {
  score: number
  detail: string
}

export interface HookScoreResult {
  score: number
  verdict: 'STRONG' | 'OK' | 'WEAK'
  flags: string[]
  weakest: HookCheckKey
  checks: Record<HookCheckKey, HookCheckResult>
  wordCount: number
}

export const HOOK_FORMULAS: HookFormula[] = [
  { id: 1, name: 'Cost Confession', template: '{Specific amount} is what {one mistake} cost me.', example: '$18,000 is what one missing clause cost me.', trap: "A fake cost. 'It cost me my peace of mind' is not a number and everybody can hear that." },
  { id: 2, name: 'Negative Command', template: 'Stop {common action}. Do {alternative} instead.', example: 'Stop posting three times a day. Post twice and reply to every comment for an hour.', trap: 'Telling people to stop doing something nobody does. The habit has to be one the viewer recognises in themselves.' },
  { id: 3, name: 'Nobody Tells You', template: 'Nobody tells you that {uncomfortable truth about the thing they want}.', example: 'Nobody tells you that your first 30 reels are supposed to flop.', trap: 'Picking a truth everybody already says. If the comments are agreeing before you finish, it was not a secret.' },
  { id: 4, name: 'The Replacement', template: '{This thing} replaced {expensive thing} for {price}.', example: 'This $12 tool replaced the editor I was paying $2,000 a month.', trap: 'Overstating the replacement. If it replaced 60% of the job, say 60%, or the comments will say it for you.' },
  { id: 5, name: 'Time Collapse', template: 'This used to take me {long time}. It now takes {short time}.', example: 'Proposals used to take me five hours. They take twenty minutes now.', trap: 'A ratio nobody believes. 40 hours to 4 seconds gets treated as a lie even when it is true.' },
  { id: 6, name: 'The Receipt', template: 'I {did thing} for {N days}. Here are the actual numbers.', example: 'I posted one reel a day for 60 days. Here is what it did to my DMs.', trap: 'Not showing the screen. A numbers video with no screen recording is a numbers claim.' },
  { id: 7, name: 'Wrong Way, Right Way', template: 'You are doing {thing} wrong, and it is not your fault. {The fix}.', example: 'You are writing captions wrong, and it is not your fault. Instagram hides everything after line one.', trap: "Skipping the absolution. 'You are doing it wrong' on its own makes people leave rather than learn." },
  { id: 8, name: 'Insider Leak', template: 'I spent {N years} {inside the thing}. Here is what we never said out loud.', example: 'I spent six years selling agency retainers. Here is what we never put in the proposal.', trap: 'Promising a secret and delivering the brochure. The comments are merciless about this one.' },
  { id: 9, name: 'The Steal', template: 'Steal this {artifact}. It took me {time} to get right.', example: 'Steal this four-line follow-up. It took me two years and a lot of dead leads.', trap: 'The artifact not being on screen. If they cannot screenshot it, there is nothing to steal.' },
  { id: 10, name: 'If This, Then Watch', template: 'If you {specific situation}, this {short time} fixes it.', example: 'If your reels get views and no followers, the next 40 seconds fix it.', trap: "A situation so broad it qualifies nobody. 'If you want to grow' is not a situation." },
  { id: 11, name: 'Numbered With A Favourite', template: '{N} {things} that {outcome}. Number {k} is the one nobody uses.', example: 'Five caption edits that double saves. Number four is the one nobody does.', trap: 'N above seven. Nobody believes you have nine good ones, and you do not.' },
  { id: 12, name: 'The Objection', template: '"{Objection they actually say}." Fine. Here is the version that works anyway.', example: '"I don\'t want to be on camera." Fine. Here is the faceless version that still sells.', trap: 'Inventing the objection. Pull it verbatim from a DM or a comment, including the bad grammar.' },
  { id: 13, name: 'Before And After, On Screen', template: '{Show the old thing}. {Show the new thing}. {One sentence on the lever}.', example: 'This was my profile in March. This is it now. I changed the name field, nothing else.', trap: 'Three levers. Name one thing that changed or the transformation stops being believable.' },
  { id: 14, name: 'The Callout', template: '{Specific group}, this is the one you have been ignoring.', example: 'Photographers charging under $2,000: this is the pricing page you have been avoiding.', trap: "A group so large it is not a callout. 'Entrepreneurs' is not a group." },
  { id: 15, name: 'The Flop Record', template: 'My first {N} {attempts} did nothing. Here is what changed on {N+1}.', example: 'My first 47 reels averaged 300 views. Number 48 did 400,000. One thing was different.', trap: "Making the change sound like luck. If the answer is 'I got lucky', there is no video." },
  { id: 16, name: 'The Verbatim Question', template: '"{Question exactly as it was asked}" - I get this every week.', example: '"How do I post consistently without hating it?" I get this one every week.', trap: 'Tidying the question up. The value is that it is in their words, typos and all.' },
  { id: 17, name: 'Head To Head', template: '{A} versus {B}. I ran both for {time} and one of them was not close.', example: 'Carousels versus reels. I ran both for 90 days and it was not close.', trap: 'Refusing to pick. A comparison with a diplomatic ending is a video with no ending.' },
  { id: 18, name: 'Cold Open Demo', template: '{Start mid-action, already doing the thing.} Watch what this does.', example: "Watch what happens when I paste a competitor's caption into this.", trap: 'A result that takes twelve seconds to arrive. If the payoff is slow, cut to it and show the wait afterwards.' },
  { id: 19, name: 'The Deadline', template: '{Thing} changes on {date}. Do {action} before then.', example: 'Your top nine grid crops change the second you post a reel. Fix the covers first.', trap: 'Manufactured urgency. One fake deadline and every future one is discounted.' },
  { id: 20, name: 'Permission', template: 'You do not need {the thing everyone says you need}.', example: 'You do not need a niche. You need one person you can name.', trap: 'Removing the blocker and putting nothing in its place. The second half is the whole video.' },
  { id: 21, name: 'Mid-Sentence Start', template: '{...and that is when {the turn}.}', example: '...and that is when the client asked for the money back. Three days after approving it.', trap: 'Never going back to fill in the gap. Deliver the setup by second eight or it reads as a mistake.' },
  { id: 22, name: 'Contrarian Flip', template: '{Well-known saying, inverted.}', example: 'Nice guys finish first.', trap: 'Flipping a saying nobody says. The original has to be a reflex, or the inversion is just a sentence.' },
  { id: 23, name: 'The Statistic', template: '{N}% of {group} {surprising fact}.', example: '33% of high school graduates never read another book.', trap: 'A statistic you cannot source. Say where it came from in the video or do not use it.' },
  { id: 24, name: 'The Reveal', template: 'This is the new {thing}.', example: 'This is the new Sony point and shoot, and it fixes the one thing I hated.', trap: 'Holding the thing up without saying what it changes. A reveal with no stake is an advert.' },
  { id: 25, name: "Someone Else's Result", template: 'There was one {person} who {outcome} in {time}.', example: 'There was one creator who grew a million subscribers in a single month.', trap: 'No name and no link. An anonymous miracle is a rumour.' },
  { id: 26, name: 'The Superlative', template: 'The {fastest / biggest / only} {thing} is {the answer}.', example: 'The fastest way to get confident is to build evidence you cannot argue with.', trap: "A superlative with a soft answer. If the second half is 'consistency', you have said nothing and the comments will tell you." },
]

const WORD_RE = /[A-Za-z0-9$%'’-]+/g
const NUMBER_SRC = String.raw`\$\s?\d[\d,]*(?:\.\d+)?|\b\d[\d,]*(?:\.\d+)?\s?(?:%|k\b|x\b|hrs?\b|hours?\b|mins?\b|minutes?\b|days?\b|weeks?\b|months?\b|years?\b|jam\b|menit\b|hari\b|minggu\b|bulan\b|tahun\b|rb\b|jt\b|juta\b|ribu\b)?`
const NUMBER_G = new RegExp(NUMBER_SRC, 'gi')
const NUMBER_START = new RegExp(`^(?:${NUMBER_SRC})`, 'i')
const PROPER_G = /(?<!^)\b[A-Z][a-z]{2,}\b/g
const HASHTAG_RE = /(?:^|\s)#\w+/
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}☀-➿]/u

const SPOKEN_NUMBERS = new Set(
  (
    'zero two three four five six seven eight nine ten eleven twelve fifteen twenty thirty forty fifty sixty seventy eighty ninety hundred thousand million billion dozen half twice triple ' +
    'nol dua tiga empat lima enam tujuh delapan sembilan sepuluh puluh ratus ribu juta miliar setengah'
  ).split(' ')
)

const MONEY_WORDS = new Set(
  (
    'dollars dollar bucks grand percent cents millionaire billionaire revenue profit salary rent ' +
    'rupiah rp omzet untung gaji cuan persen'
  ).split(' ')
)

const STAKES = new Set(
  (
    "stop never wrong mistake mistakes lost lose losing cost costs broke broken failed failure fail nobody no not don't dont doesn't didn't can't won't quit quitting fired deleted delete killed kills kill replaced replaces cut beat free paid charged hired saved first banned illegal worst hate hated wasted waste scam lie lied lying truth secret hidden stole stolen before until instead but except unless problem risk danger warning regret wish should shouldn't still already only without versus vs actually " +
    'jangan tidak nggak gak ga salah rugi bangkrut gagal hilang habis boros buang tipu rahasia bohong mahal gratis padahal tapi cuma hanya sebelum sampai tanpa kecuali ternyata masalah risiko bahaya menyesal berhenti percuma sia-sia kehilangan dipecat'
  ).split(' ')
)

const WEAK_OPENERS = [
  'so', 'ok', 'okay', 'hey', 'hi', 'hello', 'guys', 'yo', 'alright', 'welcome', 'today',
  'basically', 'honestly', 'look', 'listen', 'um', 'just', 'let', 'lets', "let's",
  'i wanted', 'i want', 'one of', 'have you', 'did you', 'do you', 'are you', 'in this',
  'in today', 'the thing', 'a lot', 'there is', 'there are', 'this is', 'it is', 'as a',
  'when it', "if you've", 'you know',
  'halo', 'hai', 'hei', 'gaes', 'jadi', 'oke', 'nah', 'hari ini', 'di video ini',
  'kali ini', 'saya mau', 'aku mau', 'pernah nggak', 'tahu nggak',
]

const IMPERATIVES = new Set(
  (
    "stop steal copy delete try watch read save use build make write send take start quit never always don't dont do put run check " +
    'jangan coba simpan tiru hapus pakai bikin buat kirim lihat cek mulai berhenti catat'
  ).split(' ')
)

const DEALBREAKERS: Array<[RegExp, string]> = [
  [/^\s*(?:stop scrolling|don'?t scroll|stop scroll|jangan scroll)/i, 'Opens with "stop scrolling". Asking for attention proves you have not earned it.'],
  [/\b(?:in (?:this|today'?s) (?:video|reel)|i'?m going to show you|i'?ll show you how|di video ini|kali ini (?:aku|saya) akan)\b/i, 'Video preamble. Delete it and open on the payoff.'],
  [/^\s*(?:hey |hi |what'?s up |welcome |halo |hai |hei )/i, 'Greeting. Nobody came to the feed to be greeted.'],
  [HASHTAG_RE, 'Hashtag in the hook. Hashtags belong at the bottom of the caption, if anywhere.'],
  [EMOJI_RE, 'Emoji in the hook. On-screen text at hook size has room for words or for an emoji, not both.'],
]

const CHECKS: HookCheckKey[] = ['LENGTH', 'SPECIFICITY', 'STAKES', 'FRONTLOAD', 'ADDRESS']

const clamp = (n: number): number => Math.max(0, Math.min(100, n))
const extractWords = (text: string): string[] =>
  String(text).replace(/(?<=\d),(?=\d)/g, '').match(WORD_RE) || []
const stripWord = (word: string): string => word.toLowerCase().replace(/^['’]+|['’]+$/g, '')
const mean = (values: number[]): number => values.reduce((a, b) => a + b, 0) / values.length

function checkLength(text: string): [number, string] {
  const n = extractWords(text).length
  const chars = text.trim().length
  let score = n >= 5 && n <= 12 ? 100 : n < 5 ? clamp(100 - (5 - n) * 20) : clamp(100 - (n - 12) * 11)
  if (chars > 60) score -= 12
  return [clamp(score), `${n} words, ${chars} chars, ~${(n / 2.75).toFixed(1)}s spoken (want 5-12 words)`]
}

function checkSpecificity(text: string): [number, string] {
  const nums = (text.match(NUMBER_G) || []).map((x) => x.trim()).filter(Boolean)
  const propers = [...new Set(text.match(PROPER_G) || [])]
  const spoken = extractWords(text)
    .map(stripWord)
    .filter((w) => SPOKEN_NUMBERS.has(w) || MONEY_WORDS.has(w))
  const hits = nums.length + propers.length + spoken.length
  const score = hits === 0 ? 15 : clamp(45 + hits * 30)
  const found = [...nums.slice(0, 2), ...propers.sort().slice(0, 2), ...spoken.slice(0, 2)].join(', ')
  return [score, `${hits} concrete marker(s)${found ? `: ${found}` : ' - no number, no name, nothing checkable'}`]
}

function checkStakes(text: string): [number, string] {
  const markers = [...new Set(extractWords(text).map(stripWord).filter((w) => STAKES.has(w)))].sort()
  if (/\$\s?\d|\bRp\.?\s?\d/i.test(text)) markers.push('a price')
  const n = markers.length
  const score = n === 0 ? 20 : n === 1 ? 70 : 100
  return [score, `${n} tension marker(s)${n > 0 ? `: ${markers.slice(0, 4).join(', ')}` : ' - nothing is at stake in this line'}`]
}

function checkFrontload(text: string): [number, string] {
  const words = extractWords(text)
  if (!words.length) return [0, 'empty']
  const low = words.map(stripWord)
  const opener = low.slice(0, 2).join(' ')
  let penalty = 0
  let weakHit: string | null = null

  for (const weak of WEAK_OPENERS) {
    if (opener.startsWith(weak) || low[0] === weak) {
      penalty = 30
      weakHit = weak
      break
    }
  }

  let payloadIdx: number | null = null
  for (let i = 0; i < low.length; i++) {
    if (
      STAKES.has(low[i]) ||
      SPOKEN_NUMBERS.has(low[i]) ||
      MONEY_WORDS.has(low[i]) ||
      NUMBER_START.test(words[i])
    ) {
      payloadIdx = i
      break
    }
  }

  let base: number
  let where: string
  if (payloadIdx === null) {
    base = 30
    where = 'no payload word anywhere in the line'
  } else if (payloadIdx <= 3) {
    base = 100
    where = `payload at word ${payloadIdx + 1}`
  } else if (payloadIdx <= 6) {
    base = 70
    where = `payload at word ${payloadIdx + 1}, could move forward`
  } else {
    base = 40
    where = `payload at word ${payloadIdx + 1}, too late`
  }

  return [clamp(base - penalty), where + (weakHit ? `; weak opener "${weakHit}"` : '')]
}

function checkAddress(text: string): [number, string] {
  const low = text.toLowerCase()
  const words = extractWords(text).map(stripWord)
  if (/\b(you|your|you're|youre|yourself|kamu|kalian|anda|lu|lo)\b|\w+mu\b/.test(low)) {
    return [100, 'speaks to the viewer']
  }
  if (words.length > 0 && IMPERATIVES.has(words[0])) {
    return [90, `imperative opener ("${words[0]}")`]
  }
  if (/\b(i|my|me|we|our|aku|saya|gue|gw|kita|kami)\b/.test(low)) {
    return [70, 'first person, no viewer named']
  }
  return [35, 'third person, nobody in the room']
}

/**
 * Menilai kekuatan hook Reel secara deterministik (0-100) berdasarkan 5 metrik dan dealbreakers.
 */
export function scoreHook(text: string): HookScoreResult {
  const rawResults: Record<HookCheckKey, [number, string]> = {
    LENGTH: checkLength(text),
    SPECIFICITY: checkSpecificity(text),
    STAKES: checkStakes(text),
    FRONTLOAD: checkFrontload(text),
    ADDRESS: checkAddress(text),
  }

  const flags = DEALBREAKERS.filter(([re]) => re.test(text)).map(([, message]) => message)
  const scores = CHECKS.map((key) => rawResults[key][0])
  const overall = clamp(mean(scores) * 0.6 + Math.min(...scores) * 0.4 - flags.length * 15)
  const verdict: HookScoreResult['verdict'] =
    overall >= 70 && Math.min(...scores) >= 55 && flags.length === 0
      ? 'STRONG'
      : overall >= 50
        ? 'OK'
        : 'WEAK'
  const weakest = CHECKS.reduce((a, b) => (rawResults[b][0] < rawResults[a][0] ? b : a))

  const checks = {} as Record<HookCheckKey, HookCheckResult>
  for (const key of CHECKS) {
    checks[key] = {
      score: Number(rawResults[key][0].toFixed(1)),
      detail: rawResults[key][1],
    }
  }

  return {
    score: Number(overall.toFixed(1)),
    verdict,
    flags,
    weakest,
    checks,
    wordCount: extractWords(text).length,
  }
}

export type LintStatus = 'PASS' | 'WARN' | 'FAIL'

export type CaptionJobType = 'A' | 'B'

export interface CaptionLintCheck {
  check: string
  status: LintStatus
  detail: string
}

export interface CaptionLintResult {
  characters: number
  limit: number
  truncate_at: number
  visible: string
  truncated: boolean
  first_line_chars: number
  hashtags: string[]
  links: string[]
  emoji: number
  asks: string[]
  checks: CaptionLintCheck[]
  blocking: CaptionLintCheck[]
  verdict: 'READY' | 'REVIEW' | 'FIX'
  where: Record<string, number>
}

export interface LintCaptionOptions {
  truncateAt?: number
  keywords?: string[]
  job?: CaptionJobType
  maxHashtags?: number
  hasDeliverableCta?: boolean
}

const LIMIT = 2200
const DEFAULT_TRUNCATE = 125
const DEFAULT_HASHTAG_LIMIT = 5

const HASHTAG_RE = /(?:^|\s)(#[A-Za-z0-9_]+)/g
const LINK_RE = /https?:\/\/\S+|\bwww\.\S+|\b[a-z0-9-]+\.(?:com|co|io|net|org|ai|app|id)\/\S*/gi
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}☀-➿←-⇿️]/gu
const CONCRETE_SRC = String.raw`\$\s?\d|\b\d[\d,.]*\b|(?<!^)\b[A-Z][a-z]{2,}\b`

const ASKS: Array<[RegExp, string]> = [
  [/\bcomment (?:the word |")?[A-Z0-9]{2,}\b/i, 'comment a keyword'],
  [/\bkomen(?:tar)? (?:kata )?"?[A-Za-z0-9]{2,}\b/i, 'comment a keyword'],
  [/\b(?:dm|message) me\b/i, 'DM me'],
  [/\b(?:dm|chat) (?:aku|saya|kami)\b/i, 'DM me'],
  [/\bsave (?:this|it)\b/i, 'save this'],
  [/\bsimpan (?:ini|video ini|postingan ini)\b/i, 'save this'],
  [/\b(?:save|simpan) (?:reel|video|konten|postingan) ini\b/i, 'save this'],
  [/\bkomen(?:tar)?\s*[:,]?\s*(?:ya\b)?[^\n]*\?/i, 'answer a question'],
  [/\btulis di komentar\b/i, 'answer a question'],
  [/\bfollow (?:kalau|biar|untuk|buat)\b/i, 'follow'],
  [/\bshare (?:this|it)\b/i, 'share this'],
  [/\bbagikan (?:ini|ke)\b/i, 'share this'],
  [/\bfollow (?:me|for)\b/i, 'follow'],
  [/\b(?:ikuti|follow) (?:aku|akun ini|kami)\b/i, 'follow'],
  [/\blink in (?:my )?bio\b/i, 'link in bio'],
  [/\blink (?:ada )?di bio\b/i, 'link in bio'],
  [/\b(?:swipe|tap) (?:through|left|right|for|to)\b/i, 'swipe or tap'],
  [/\btell me\b|\bwhat would you\b|\bwhich one\b/i, 'answer a question'],
]

const FILLER_TAGS = new Set(
  '#viral #fyp #explore #explorepage #foryou #foryoupage #trending #instagood #love #follow #like4like #reels #reelsinstagram #viralreels #instadaily #fypシ #fypindonesia #xyzbca'.split(
    ' '
  )
)

const MUST_WARN_CHECKS = new Set(['ONE ASK', 'LINKS', 'SEARCH TERMS', 'TAG PLACEMENT', 'HASHTAGS'])

const cpLen = (s: string): number => Array.from(s).length
const cpSlice = (s: string, n: number): string => Array.from(s).slice(0, n).join('')
const escapeRegex = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Memeriksa kualitas caption Instagram (9 cek deterministik + preview 125 karakter sebelum '... more').
 */
export function lintCaption(rawText: string, options: LintCaptionOptions = {}): CaptionLintResult {
  const cut = options.truncateAt ?? DEFAULT_TRUNCATE
  const maxHashtags = options.maxHashtags ?? DEFAULT_HASHTAG_LIMIT
  const job = options.job ?? 'B'
  const keywords = (options.keywords ?? []).map((k) => k.trim()).filter(Boolean)

  const text = rawText.replace(/\s+$/, '')
  const stripped = text.trim()
  const chars = cpLen(stripped)
  const lines = stripped.split('\n')
  const first = (lines[0] || '').trim()
  const tags = [...stripped.matchAll(HASHTAG_RE)].map((m) => m[1])
  const links = stripped.match(LINK_RE) || []
  const emoji = stripped.match(EMOJI_RE) || []
  const truncated = chars > cut
  const windowText = truncated ? cpSlice(stripped, cut) : stripped
  const asks = [...new Set(ASKS.filter(([re]) => re.test(stripped)).map(([, label]) => label))]
  const filler = tags.filter((tag) => FILLER_TAGS.has(tag.toLowerCase()))
  const concreteN = (windowText.match(new RegExp(CONCRETE_SRC, 'gm')) || []).length

  const checks: CaptionLintCheck[] = []
  const add = (check: string, status: LintStatus, detail: string) => checks.push({ check, status, detail })

  add(
    'LENGTH',
    chars > LIMIT ? 'FAIL' : 'PASS',
    `${chars} / ${LIMIT} characters${chars > LIMIT ? `, ${chars - LIMIT} over the limit` : ''}`
  )

  if (!first) {
    add('FIRST LINE', 'FAIL', 'the caption opens on a blank line')
  } else if (first.startsWith('#') || first.startsWith('@')) {
    add('FIRST LINE', 'FAIL', 'opens on a hashtag or a mention, which is the one position worth a sentence')
  } else if (cpLen(first) > cut) {
    add(
      'FIRST LINE',
      'WARN',
      `${cpLen(first)} characters, so it gets cut at ${cut} mid-thought. Fine if the cut is a cliffhanger, bad if it is a subordinate clause`
    )
  } else {
    add('FIRST LINE', 'PASS', `${cpLen(first)} characters, lands whole`)
  }

  if (job === 'A' && concreteN === 0) {
    add('HOOK IS CONCRETE', 'PASS', 'Job A: the hook is in the video, line 1 of the caption is the ask')
  } else {
    add(
      'HOOK IS CONCRETE',
      concreteN > 0 ? 'PASS' : 'WARN',
      `${concreteN} number(s) or name(s) in the visible window${concreteN > 0 ? '' : ' - nothing checkable before the tap'}`
    )
  }

  if (tags.length > DEFAULT_HASHTAG_LIMIT) {
    add('HASHTAGS', 'FAIL', `${tags.length} tags, over Instagram's cap of ${DEFAULT_HASHTAG_LIMIT}`)
  } else if (tags.length > maxHashtags) {
    add('HASHTAGS', 'WARN', `${tags.length} tags, use at most ${maxHashtags}`)
  } else if (tags.length === DEFAULT_HASHTAG_LIMIT && filler.length > 0) {
    add('HASHTAGS', 'WARN', `${tags.length} tags, at the cap, and ${filler.length} of them generic. Spend the five on topics`)
  } else if (filler.length > 0) {
    add('HASHTAGS', 'WARN', `${tags.length} tags, ${filler.length} of them generic (${filler.slice(0, 3).join(', ')}). Those describe nothing`)
  } else {
    add('HASHTAGS', 'PASS', `${tags.length} tag(s)${tags.length > 0 ? `: ${tags.join(' ')}` : ''}`)
  }

  if (tags.length === 0) {
    add('TAG PLACEMENT', 'PASS', 'no tags to place')
  } else if (tags.some((t) => new RegExp(`(?:^|\\s)${escapeRegex(t)}\\b`).test(windowText))) {
    add('TAG PLACEMENT', 'WARN', 'a hashtag is inside the visible window, spending feed space on a label')
  } else {
    add('TAG PLACEMENT', 'PASS', 'tags are below the fold')
  }

  add(
    'LINKS',
    links.length > 0 ? 'WARN' : 'PASS',
    links.length > 0
      ? `${links.length} link(s) in the caption, and captions are not clickable. Move it to the bio or the DM`
      : 'no dead links in the body'
  )

  if (asks.length === 1) {
    add('ONE ASK', 'PASS', `one call to action: ${asks[0]}`)
  } else if (asks.length === 0) {
    add('ONE ASK', 'WARN', 'no call to action. Decide what this post is for')
  } else {
    add('ONE ASK', 'WARN', `${asks.length} asks (${asks.join(', ')}). Two asks is the same as none`)
  }

  const density = (emoji.length * 100) / Math.max(chars, 1)
  add(
    'EMOJI',
    density > 4 ? 'WARN' : 'PASS',
    `${emoji.length} emoji, ${density.toFixed(1)} per 100 characters${density > 4 ? ' - reads as decoration' : ''}`
  )

  const where: Record<string, number> = {}
  if (keywords.length > 0) {
    const low = stripped.toLowerCase()
    const found = keywords.filter((k) => low.includes(k.toLowerCase()))
    const missing = keywords.filter((k) => !low.includes(k.toLowerCase()))
    const inWindow = found.filter((k) => windowText.toLowerCase().includes(k.toLowerCase()))
    const status: LintStatus = missing.length === 0 ? 'PASS' : found.length > 0 ? 'WARN' : 'FAIL'
    add(
      'SEARCH TERMS',
      status,
      `${found.length}/${keywords.length} present${found.length > 0 ? `, ${inWindow.length} in the visible window` : ''}${missing.length > 0 ? `. Missing: ${missing.join(', ')}` : ''}`
    )
    const nonEmpty = lines.map((l) => l.trim()).filter(Boolean)
    for (const kw of found) {
      const idx = nonEmpty.findIndex((l) => l.toLowerCase().includes(kw.toLowerCase()))
      where[kw] = idx + 1
    }
  }

  const blocking = checks.filter(
    (c) => c.status === 'FAIL' || (c.status === 'WARN' && MUST_WARN_CHECKS.has(c.check))
  )

  if (
    options.hasDeliverableCta === false &&
    /\b(?:[Kk]omen(?:tar)?|[Cc]omment|[Kk]etik|DM|dm)\s*[:]?\s*["“']?[A-Z]{3,}\b/.test(stripped)
  ) {
    const fakeKeywordCheck: CaptionLintCheck = {
      check: 'FAKE KEYWORD',
      status: 'FAIL',
      detail:
        'a comment/DM keyword was used but there is nothing to deliver. Replace it with the same ask as the video (a question or save/follow), no capital-letter keyword.',
    }
    checks.push(fakeKeywordCheck)
    blocking.push(fakeKeywordCheck)
  }

  const fails = checks.filter((c) => c.status === 'FAIL').length
  const warns = checks.filter((c) => c.status === 'WARN').length
  const verdict: CaptionLintResult['verdict'] = fails > 0 ? 'FIX' : warns > 0 ? 'REVIEW' : 'READY'

  return {
    characters: chars,
    limit: LIMIT,
    truncate_at: cut,
    visible: windowText,
    truncated,
    first_line_chars: cpLen(first),
    hashtags: tags,
    links,
    emoji: emoji.length,
    asks,
    checks,
    blocking,
    verdict,
    where,
  }
}

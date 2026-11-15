import { HUMANIZER_LEXICON, type HumanizerLexicon } from './lexicon'

export interface HumanizerHit {
  name: string
  count: number
}

export interface HumanizerResult {
  text: string
  artefacts: number
  hits: {
    invisible: HumanizerHit[]
    typographic: HumanizerHit[]
    lexical: HumanizerHit[]
  }
}

export interface StructuralFlag {
  name: string
  count: number
  fix: string
}

const URL_RE = /https?:\/\/\S+|www\.\S+|\S+@\S+\.\S+/g
const SENTENCE_RE = /[^.!?\n]+[.!?]*/g

const mean = (values: number[]): number =>
  values.reduce((acc, value) => acc + value, 0) / values.length

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function protectUrls(text: string): [string, string[]] {
  const found: string[] = []
  const output = text.replace(URL_RE, (match) => {
    found.push(match)
    return `\u0000URL${found.length - 1}\u0000`
  })
  return [output, found]
}

function restoreUrls(text: string, found: string[]): string {
  let result = text
  found.forEach((url, index) => {
    result = result.split(`\u0000URL${index}\u0000`).join(url)
  })
  return result
}

function parseCodePoint(spec: string): number | [number, number] {
  if (spec.includes('-')) {
    const [start, end] = spec.split('-').map((part) => parseInt(part.replace('U+', ''), 16))
    return [start, end]
  }
  return parseInt(spec.replace('U+', ''), 16)
}

function passInvisible(text: string, lex: HumanizerLexicon): [string, HumanizerHit[]] {
  const hits: HumanizerHit[] = []
  let output = text

  for (const entry of lex.invisible) {
    const cp = parseCodePoint(entry.cp)
    const re = Array.isArray(cp)
      ? new RegExp(`[\\u{${cp[0].toString(16)}}-\\u{${cp[1].toString(16)}}]`, 'gu')
      : new RegExp(`\\u{${cp.toString(16)}}`, 'gu')
    const count = (output.match(re) || []).length
    if (count > 0) {
      hits.push({ name: `${entry.cp} ${entry.name}`, count })
      output = output.replace(re, entry.action === 'delete' ? '' : ' ')
    }
  }

  const stray = output.match(/\p{Cf}/gu) || []
  if (stray.length > 0) {
    hits.push({ name: 'other invisible format chars', count: stray.length })
    output = output.replace(/\p{Cf}/gu, '')
  }

  return [output, hits]
}

function passTypographic(text: string, lex: HumanizerLexicon): [string, HumanizerHit[]] {
  const hits: HumanizerHit[] = []
  let output = text

  for (const entry of lex.typographic) {
    const ch = entry.from
    const count = output.split(ch).length - 1
    if (count === 0) continue

    hits.push({ name: `${ch} ${entry.name}`, count })
    if (ch === '—') {
      output = output.replace(/\s*—\s*/g, ', ')
    } else if (ch === '–') {
      output = output.replace(/\s*–\s*(?=\d)/g, '-')
      output = output.replace(/\s+–\s+/g, ', ')
      output = output.split('–').join('-')
    } else {
      output = output.split(ch).join(entry.to)
    }
  }

  output = output.replace(/,\s*([,.;:!?])/g, '$1').replace(/,\s*\n/g, '\n')
  return [output, hits]
}

function matchCase(source: string, replacement: string): string {
  if (!replacement) return replacement
  if (source === source.toUpperCase() && source.length > 1 && /[A-Z]/.test(source)) {
    return replacement.toUpperCase()
  }
  if (/^[A-Z]/.test(source)) {
    return replacement[0].toUpperCase() + replacement.slice(1)
  }
  return replacement
}

function passLexical(text: string, lex: HumanizerLexicon): [string, HumanizerHit[]] {
  const hits: HumanizerHit[] = []
  let output = text
  const entries = [...lex.phrases, ...lex.words].sort((a, b) => b.find.length - a.find.length)

  for (const entry of entries) {
    const re = new RegExp(`\\b${escapeRegex(entry.find).replace(/\\? /g, '\\s+')}\\b`, 'gi')
    const found = output.match(re)
    if (!found) continue

    hits.push({ name: `${entry.find} -> ${entry.replace || '(deleted)'}`, count: found.length })
    output = output.replace(re, (match) => matchCase(match, entry.replace))
  }

  output = output
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/^[ \t]*(?:[,.;:]+[ \t]*)+/gm, '')
    .replace(/^[ \t](?=\S)/gm, '')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/,\s*([,.;:!?])/g, '$1')
    .split('...')
    .join('\u0000ELL\u0000')
    .replace(/\.\s*\.+/g, '.')
    .replace(/([!?])\s*\./g, '$1')
    .split('\u0000ELL\u0000')
    .join('...')
    .replace(/^[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/,\s*(also|so|still|basically|in the end)\s*,\s*/g, (_m, word: string) => {
      return `. ${word[0].toUpperCase()}${word.slice(1)}, `
    })

  return [output, hits]
}

function restoreCapitals(original: string, text: string): string {
  const starts = [...original.matchAll(/(?:^|[.!?]\s+|\n)\s*([A-Za-z])/g)].map((m) => m[1])
  if (!starts.length || starts.filter((c) => c === c.toUpperCase()).length * 2 < starts.length) {
    return text
  }
  return text.replace(/(^|(?<=[.!?] )|(?<=[.!?]\n)|(?<=\n))(\s*)([a-z])/g, (_m, a, b, c: string) => {
    return `${a}${b}${c.toUpperCase()}`
  })
}

/**
 * Memindai pola kalimat klise AI dan variasi panjang kalimat yang terlalu seragam.
 */
export function scanStructures(text: string, lex: HumanizerLexicon = HUMANIZER_LEXICON): StructuralFlag[] {
  const flags: StructuralFlag[] = []

  for (const rule of lex.structures) {
    let re: RegExp
    try {
      re = new RegExp(rule.source, `${rule.flags}g`)
    } catch {
      continue
    }
    const found = text.match(re)
    if (found) {
      flags.push({ name: rule.name, count: found.length, fix: rule.fix })
    }
  }

  const lengths = (text.match(SENTENCE_RE) || [])
    .map((segment) => segment.trim().split(/\s+/).length)
    .filter((len) => len > 2)

  if (lengths.length >= 4) {
    const avg = mean(lengths)
    const variance = mean(lengths.map((len) => (len - avg) ** 2))
    const cv = Math.sqrt(variance) / avg
    if (cv < 0.35) {
      flags.push({
        name: `Uniform sentence length (variation ${cv.toFixed(2)})`,
        count: lengths.length,
        fix: 'Break one sentence in half. Let another run long.',
      })
    }
  }

  return flags
}

/**
 * Membersihkan karakter tak terlihat, tipografi khas AI (em-dash, smart quotes),
 * serta frasa AI-slop (opsional untuk bahasa Inggris).
 */
export function humanizeText(
  input: string,
  options: { lexical?: boolean; lexicon?: HumanizerLexicon } = {}
): HumanizerResult {
  const lex = options.lexicon ?? HUMANIZER_LEXICON
  const lexical = options.lexical ?? true
  const raw = input

  const [protectedText, urls] = protectUrls(input)
  const [afterInvisible, invisible] = passInvisible(protectedText, lex)
  const [afterTypographic, typographic] = passTypographic(afterInvisible, lex)
  let text = afterTypographic
  let lexicalHits: HumanizerHit[] = []

  if (lexical) {
    ;[text, lexicalHits] = passLexical(text, lex)
  }

  text = restoreCapitals(raw, text)
  text = restoreUrls(text, urls).trim()

  const artefacts = [...invisible, ...typographic, ...lexicalHits].reduce((sum, hit) => sum + hit.count, 0)

  return {
    text,
    artefacts,
    hits: {
      invisible,
      typographic,
      lexical: lexicalHits,
    },
  }
}

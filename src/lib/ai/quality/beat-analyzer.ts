import { ACRONYM_READ_MAP } from './lexicon'

export interface BeatRow {
  n: number
  start: number
  dur: number
  tc: string
  words: number
  text: string
  concrete: number
  label: 'HOOK' | 'MID' | 'CTA' | 'HOOK/CTA' | ''
  flags: string[]
}

export interface BeatAnalysisResult {
  wpm: number
  target: number | null
  total_seconds: number
  total_words: number
  beats: BeatRow[]
  notes: string[]
  blocking: string[]
  looped: boolean
}

const B_WORD_RE = /[A-Za-z0-9$%'’-]+/g
const B_SENT_RE = /[^.!?]+[.!?]*/g
const CONCRETE_RE = /\$\s?\d|\b\d[\d,.]*\b|(?<!^)\b[A-Z][a-z]{2,}\b/g

const STOPWORDS = new Set(
  (
    'the a an and or but if of to in on for with that this it is are was were be been you your i my me we our they them he she so just not no do did does have has had will can at as by from out up off one all ' +
    'yang dan di ke dari untuk itu ini kamu aku saya kita kami tidak ga gak nggak ya sih aja juga jadi ada itu dengan atau'
  ).split(' ')
)

const HOOK_WINDOW = 3.0
const MAX_BEAT = 4.0
const ABSTRACT_RUN = 3

const extractWords = (text: string): string[] =>
  String(text).replace(/(?<=\d),(?=\d)/g, '').match(B_WORD_RE) || []

const prettyToken = (token: string): string => token.replace(/(\d)(?=(\d{3})+$)/g, '$1,')

function formatTimecode(sec: number): string {
  const mins = Math.floor(sec / 60)
  const secs = sec - mins * 60
  return `${mins}:${secs.toFixed(1).padStart(4, '0')}`
}

/**
 * Memecah script mentah menjadi baris beat yang durasinya masih wajar diucapkan.
 */
export function splitBeats(raw: string, wps: number): string[] {
  const beats: string[] = []
  for (const line of raw.split('\n').map((l) => l.trim())) {
    if (!line) continue
    if (extractWords(line).length / wps <= MAX_BEAT * 1.5) {
      beats.push(line)
      continue
    }
    const parts = (line.match(B_SENT_RE) || []).map((p) => p.trim()).filter(Boolean)
    let buf = ''
    for (const part of parts) {
      const candidate = `${buf} ${part}`.trim()
      if (buf && extractWords(candidate).length / wps > MAX_BEAT) {
        beats.push(buf)
        buf = part
      } else {
        buf = candidate
      }
    }
    if (buf) beats.push(buf)
  }
  return beats
}

/**
 * Menghasilkan panduan cara baca singkatan agar TTS / pengisi suara tidak salah melafalkan.
 */
export function getAcronymReadingNotes(
  text: string,
  readMap: Record<string, string> = ACRONYM_READ_MAP
): string[] {
  const acronyms = [...new Set(text.match(/\b[A-Z]{2,6}\b/g) || [])]
  return acronyms.map((acr) =>
    readMap[acr]
      ? `${acr} dibaca "${readMap[acr]}"`
      : `${acr}: tentukan cara bacamu (per huruf atau satu kata) dan konsisten`
  )
}

/**
 * Menganalisis timing beat sheet script Reel berdasarkan WPM dan target durasi.
 */
export function analyzeBeats(
  rawScript: string,
  options: { wpm?: number; targetSeconds?: number | null } = {}
): BeatAnalysisResult | null {
  const wpm = options.wpm ?? 165
  const target = options.targetSeconds ?? null
  const wps = wpm / 60
  const beats = splitBeats(rawScript, wps)
  if (!beats.length) return null

  const rows: BeatRow[] = []
  let clock = 0

  beats.forEach((text, index) => {
    const wordCount = extractWords(text).length
    const dur = wordCount / wps
    rows.push({
      n: index + 1,
      start: Number(clock.toFixed(2)),
      dur: Number(dur.toFixed(2)),
      tc: formatTimecode(clock),
      words: wordCount,
      text,
      concrete: (text.match(CONCRETE_RE) || []).length,
      label: '',
      flags: [],
    })
    clock += dur
  })

  const total = clock
  for (const row of rows) {
    if (row.n === 1 || row.start + row.dur <= HOOK_WINDOW) {
      row.label = 'HOOK'
    }
  }
  const last = rows[rows.length - 1]
  last.label = last.label !== 'HOOK' ? 'CTA' : 'HOOK/CTA'

  const half = total / 2
  for (const row of rows) {
    if (!row.label && row.start <= half && half < row.start + row.dur) {
      row.label = 'MID'
    }
  }

  const notes: string[] = []
  const blocking: string[] = []

  if (rows[0].dur > HOOK_WINDOW) {
    rows[0].flags.push(`hook runs ${rows[0].dur.toFixed(1)}s, past the ${HOOK_WINDOW}s mark`)
    const message = `Beat 1 takes ${rows[0].dur.toFixed(1)}s to say. Cut it to ${Math.floor(HOOK_WINDOW * wps)} words or fewer.`
    notes.push(message)
    blocking.push(message)
  }

  if (rows[0].concrete === 0) {
    notes.push('Beat 1 has no number and no name in it. Hooks without something checkable get scrolled.')
  }

  for (const row of rows) {
    if (row.dur > MAX_BEAT) {
      row.flags.push(`${row.dur.toFixed(1)}s on one beat`)
    }
  }

  const longBeats = rows.filter((r) => r.dur > MAX_BEAT).map((r) => r.n)
  if (longBeats.length > 0) {
    const message = `Beat(s) ${longBeats.join(', ')} run past ${MAX_BEAT}s. Split the line or shorten it.`
    notes.push(message)
    blocking.push(message)
  }

  let run = 0
  let startBeat: number | null = null
  for (const row of rows) {
    if (row.concrete === 0) {
      run++
      if (startBeat === null) startBeat = row.n
      if (run === ABSTRACT_RUN) {
        const message = `Beats ${startBeat}-${row.n} have nothing concrete in them. Put a number, a name or a price in one of them.`
        notes.push(message)
        blocking.push(message)
      }
    } else {
      run = 0
      startBeat = null
    }
  }

  const significantWords = (text: string) =>
    new Set(
      extractWords(text)
        .map((w) => w.toLowerCase())
        .filter((w) => !STOPWORDS.has(w))
    )

  const firstWords = significantWords(rows[0].text)
  const lastWords = significantWords(rows[rows.length - 1].text)
  const loopWords = [...firstWords].filter((w) => lastWords.has(w)).sort().map(prettyToken)
  let looped = false

  if (loopWords.length > 0) {
    looped = true
    notes.push(
      `Loops: the last beat repeats "${loopWords.slice(0, 3).join(', ')}" from the hook. Second watches are free reach.`
    )
  } else {
    const message = 'No loop. The last beat shares no word with the hook. Echo one word from beat 1 in the last line.'
    notes.push(message)
    blocking.push(message)
  }

  if (target) {
    const delta = total - target
    if (Math.abs(delta) <= target * 0.1) {
      notes.push(`Length is on target (${total.toFixed(1)}s against ${target}s).`)
    } else if (delta > 0) {
      const message = `${delta.toFixed(1)}s over target. Cut about ${Math.floor(delta * wps)} words.`
      notes.push(message)
      if (Math.abs(delta) > target * 0.2) blocking.push(message)
    } else {
      const message = `${(-delta).toFixed(1)}s under target. Add about ${Math.floor(-delta * wps)} words or shoot it short.`
      notes.push(message)
      if (Math.abs(delta) > target * 0.35) blocking.push(message)
    }
  }

  const badPlaceholders = rawScript.match(/\{\{(?!angka kamu\}\})[^}]*\}\}/g) || []
  if (badPlaceholders.length > 0) {
    blocking.push(
      `Remove ${badPlaceholders.join(' ')}: curly-brace placeholders are ONLY allowed as exactly {{angka kamu}} for a missing number.`
    )
  }

  return {
    wpm,
    target,
    total_seconds: Number(total.toFixed(2)),
    total_words: rows.reduce((sum, r) => sum + r.words, 0),
    beats: rows,
    notes,
    blocking,
    looped,
  }
}

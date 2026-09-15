'use client'

import { useState } from 'react'
import { Check, ChevronDown, Clipboard, Film, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Shot = {
  subjek: string
  aksi: string
  setting: string
  gerakan_kamera: string
  gaya_visual: string
  pencahayaan: string
  durasi_pacing: string
  catatan_tambahan: string
}

const DEMO_SHOTS: Shot[] = [
  {
    subjek: 'wanita usia 20-an, rambut dikuncir, kaos olahraga warna krem',
    aksi: 'menuangkan air ke gelas kaca di dapur, gerakan tenang dan sengaja',
    setting: 'dapur minimalis dengan jendela besar, pagi hari',
    gerakan_kamera: 'static dengan sedikit push-in perlahan',
    gaya_visual: 'sinematik minimalis, vertikal TikTok-style',
    pencahayaan: 'natural light pagi, soft, dari jendela sebelah kiri frame',
    durasi_pacing: '4 detik, calm dan deliberate',
    catatan_tambahan: 'palet warna warm neutral, fokus pada tekstur kaca dan kayu',
  },
  {
    subjek: 'wanita yang sama, duduk di meja dapur',
    aksi: 'membuka jurnal dan mulai menulis, gerakan pelan',
    setting: 'meja dapur dekat jendela, pagi hari',
    gerakan_kamera: 'tracking shot pelan dari samping',
    gaya_visual: 'sinematik minimalis, vertikal TikTok-style',
    pencahayaan: 'natural light pagi, konsisten dengan shot sebelumnya',
    durasi_pacing: '3 detik, calm',
    catatan_tambahan: 'jaga kontinuitas warna dan mood dengan shot 1',
  },
]

const FIELD_LABELS: { key: keyof Shot; label: string }[] = [
  { key: 'subjek', label: 'Subjek' },
  { key: 'aksi', label: 'Aksi' },
  { key: 'setting', label: 'Setting' },
  { key: 'gerakan_kamera', label: 'Gerakan Kamera' },
  { key: 'gaya_visual', label: 'Gaya Visual' },
  { key: 'pencahayaan', label: 'Pencahayaan' },
  { key: 'durasi_pacing', label: 'Durasi & Pacing' },
  { key: 'catatan_tambahan', label: 'Catatan Tambahan' },
]

function buildFinalPrompt(shot: Shot) {
  return [
    shot.subjek,
    `${shot.aksi}.`,
    `${shot.setting}.`,
    `Kamera ${shot.gerakan_kamera}.`,
    `Gaya ${shot.gaya_visual}.`,
    `Pencahayaan ${shot.pencahayaan}.`,
    `Durasi ${shot.durasi_pacing}.`,
    `${shot.catatan_tambahan}.`,
  ].join(' ').replace(/\s+/g, ' ').trim()
}

export function VideoPromptReviewDemo() {
  const [shots, setShots] = useState(DEMO_SHOTS)
  const [expandedIndex, setExpandedIndex] = useState(0)
  const [status, setStatus] = useState<'idle' | 'generating' | 'done'>('idle')
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const updateShot = (index: number, key: keyof Shot, value: string) => {
    setShots((current) => current.map((shot, shotIndex) => shotIndex === index ? { ...shot, [key]: value } : shot))
  }

  const handleGenerate = () => {
    setStatus('generating')
    window.setTimeout(() => setStatus('done'), 900)
  }

  return (
    <main className="min-h-screen bg-[#16171a] px-5 py-8 text-[#ededed]">
      <div className="mx-auto max-w-2xl">
        <div className="mb-1 flex items-center gap-2">
          <Film className="h-[18px] w-[18px] text-[#c9a227]" />
          <span className="font-mono text-[11px] tracking-[1.5px] text-[#8b8d93]">REVIEW SEBELUM GENERATE</span>
        </div>
        <h1 className="mb-1 font-serif text-[26px] font-medium">Rutinitas pagi produktif</h1>
        <p className="mb-6 text-[13.5px] leading-relaxed text-[#8b8d93]">{shots.length} shot disiapkan dari idemu. Buka tiap shot untuk edit detailnya sebelum dikirim ke model video.</p>

        <div className="flex flex-col gap-2.5">
          {shots.map((shot, index) => {
            const expanded = expandedIndex === index
            const finalPrompt = buildFinalPrompt(shot)
            return (
              <section key={index} className="overflow-hidden rounded border border-[#2e2f33] bg-[#1f2023]">
                <button type="button" onClick={() => setExpandedIndex(expanded ? -1 : index)} className="flex w-full items-center justify-between px-[18px] py-3.5 text-left">
                  <span className="truncate"><span className="mr-3 font-mono text-xs tracking-widest text-[#c9a227]">SHOT {String(index + 1).padStart(2, '0')}</span><span className="font-serif text-[17px]">{shot.subjek.split(',')[0]}</span></span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-[#8b8d93] transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </button>

                {expanded && (
                  <div className="border-t border-[#2e2f33] px-[18px] pb-[18px] pt-3">
                    <div className="mb-4 grid gap-2.5 sm:grid-cols-[140px_1fr]">
                      {FIELD_LABELS.map(({ key, label }) => (
                        <div key={key} className="contents">
                          <label htmlFor={`demo-${index}-${key}`} className="pt-2 font-mono text-[11px] tracking-wide text-[#8b8d93]">{label}</label>
                          <textarea id={`demo-${index}-${key}`} value={shot[key]} onChange={(event) => updateShot(index, key, event.target.value)} rows={shot[key].length > 60 ? 2 : 1} className="w-full resize-y rounded border border-[#2e2f33] bg-[#16171a] px-2.5 py-1.5 text-[13.5px] leading-relaxed text-[#ededed] outline-none focus:border-[#c9a227]" />
                        </div>
                      ))}
                    </div>

                    <div className="rounded border border-[#2e2f33] bg-[#16171a] p-3">
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="font-mono text-[10px] tracking-widest text-[#8b8d93]">PROMPT AKHIR</span>
                        <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-[#8b8d93]" onClick={async () => { await navigator.clipboard?.writeText(finalPrompt); setCopiedIndex(index); window.setTimeout(() => setCopiedIndex(null), 1500) }}>
                          {copiedIndex === index ? <Check className="h-3 w-3" /> : <Clipboard className="h-3 w-3" />}
                          {copiedIndex === index ? 'Disalin' : 'Salin'}
                        </Button>
                      </div>
                      <p className="m-0 font-serif text-[13.5px] leading-relaxed text-[#c7c8cc]">{finalPrompt}</p>
                    </div>
                  </div>
                )}
              </section>
            )
          })}
        </div>

        <Button onClick={handleGenerate} disabled={status === 'generating'} className={`mt-[22px] h-auto w-full gap-2 rounded bg-[#c9a227] py-3 text-sm font-semibold text-[#16171a] hover:bg-[#d6b33e] ${status === 'done' ? 'bg-[#3a4a3d] text-[#9ecb99] hover:bg-[#3a4a3d]' : ''}`}>
          {status === 'generating' && <Loader2 className="h-[15px] w-[15px] animate-spin" />}
          {status === 'idle' && `Generate ${shots.length} Video`}
          {status === 'generating' && 'Mengirim ke model video...'}
          {status === 'done' && 'Terkirim - cek status di bawah'}
        </Button>
      </div>
    </main>
  )
}
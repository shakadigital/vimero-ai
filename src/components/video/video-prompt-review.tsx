'use client'

import { useCallback, useEffect, useState } from 'react'
import { Check, ChevronDown, Clipboard, Film, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { generateVideoPromptReview } from '@/lib/actions/studio'
import { toast } from 'sonner'

export interface VideoPromptShot {
  subjek: string
  aksi: string
  setting: string
  gerakan_kamera: string
  gaya_visual: string
  pencahayaan: string
  durasi_pacing: string
  catatan_tambahan: string
}

const fields: { key: keyof VideoPromptShot; label: string }[] = [
  { key: 'subjek', label: 'Subjek' },
  { key: 'aksi', label: 'Aksi' },
  { key: 'setting', label: 'Setting' },
  { key: 'gerakan_kamera', label: 'Gerakan Kamera' },
  { key: 'gaya_visual', label: 'Gaya Visual' },
  { key: 'pencahayaan', label: 'Pencahayaan' },
  { key: 'durasi_pacing', label: 'Durasi & Pacing' },
  { key: 'catatan_tambahan', label: 'Catatan Tambahan' },
]

function buildFinalPrompt(shot: VideoPromptShot) {
  return [
    shot.subjek,
    `${shot.aksi}.`,
    `${shot.setting}.`,
    `Kamera ${shot.gerakan_kamera}.`,
    `Gaya ${shot.gaya_visual}.`,
    `Pencahayaan ${shot.pencahayaan}.`,
    `Durasi ${shot.durasi_pacing}.`,
    `${shot.catatan_tambahan}. Cinematic direction: cinematic haze, lens flare, depth of field.`,
  ].join(' ').replace(/\s+/g, ' ').trim()
}

interface VideoPromptReviewProps {
  businessId: string
  contentId: string
  onPromptReady: (prompt: string) => void
}

export function VideoPromptReview({ businessId, contentId, onPromptReady }: VideoPromptReviewProps) {
  const [shots, setShots] = useState<VideoPromptShot[]>([])
  const [expandedIndex, setExpandedIndex] = useState(0)
  const [isGenerating, setIsGenerating] = useState(true)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const generatePromptReview = useCallback(async (showLoading = true) => {
    if (showLoading) setIsGenerating(true)
    try {
      const result = await generateVideoPromptReview(businessId, contentId)
      setShots(result.shots)
      setExpandedIndex(0)
      toast.success(`${result.shots.length} shot siap direview`)
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Gagal membuat draft prompt video')
    } finally {
      setIsGenerating(false)
    }
  }, [businessId, contentId])

  useEffect(() => {
    const loadPromptReview = window.setTimeout(() => {
      void generatePromptReview(false)
    }, 0)
    return () => window.clearTimeout(loadPromptReview)
  }, [generatePromptReview])

  const updateShot = (index: number, key: keyof VideoPromptShot, value: string) => {
    setShots((current) => current.map((shot, shotIndex) => shotIndex === index ? { ...shot, [key]: value } : shot))
  }

  const usePrompt = () => {
    if (shots.length === 0) return
    onPromptReady(shots.map(buildFinalPrompt).join('\n\n'))
    toast.success('Prompt siap dipakai untuk generate video')
  }

  return (
    <Card className="border-primary/20 bg-card/80">
      <CardHeader className="border-b border-border/60">
        <CardTitle className="flex items-center gap-2">
          <Film className="h-4 w-4 text-primary" />
          Review Prompt Video
        </CardTitle>
        <p className="text-xs text-muted-foreground">Buat draft shot dari naskah, edit detailnya, lalu teruskan ke generator.</p>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        <Button className="w-full gap-2" variant={shots.length ? 'outline' : 'default'} onClick={() => void generatePromptReview()} disabled={isGenerating}>
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {isGenerating ? 'Menyusun draft shot dari naskah...' : 'Buat Ulang Draft Prompt AI'}
        </Button>

        {shots.map((shot, index) => {
          const expanded = expandedIndex === index
          const finalPrompt = buildFinalPrompt(shot)
          return (
            <div key={index} className="overflow-hidden rounded-lg border border-border/70 bg-muted/20">
              <button type="button" className="flex w-full items-center justify-between gap-3 p-3 text-left" onClick={() => setExpandedIndex(expanded ? -1 : index)}>
                <span className="min-w-0 truncate text-sm font-medium"><span className="mr-2 font-mono text-xs text-primary">SHOT {String(index + 1).padStart(2, '0')}</span>{shot.subjek}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </button>
              {expanded && (
                <div className="space-y-3 border-t border-border/60 p-3">
                  <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
                    {fields.map(({ key, label }) => (
                      <div key={key} className="contents">
                        <Label htmlFor={`shot-${index}-${key}`} className="pt-2 text-xs text-muted-foreground">{label}</Label>
                        <textarea id={`shot-${index}-${key}`} value={shot[key]} onChange={(event) => updateShot(index, key, event.target.value)} rows={shot[key].length > 70 ? 2 : 1} className="min-h-9 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                      </div>
                    ))}
                  </div>
                  <div className="rounded-md border border-border/60 bg-background/70 p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Prompt Akhir</span>
                      <Button variant="ghost" size="sm" className="h-7 gap-1.5" onClick={async () => { await navigator.clipboard?.writeText(finalPrompt); setCopiedIndex(index); window.setTimeout(() => setCopiedIndex(null), 1500) }}>
                        {copiedIndex === index ? <Check className="h-3.5 w-3.5" /> : <Clipboard className="h-3.5 w-3.5" />}
                        {copiedIndex === index ? 'Disalin' : 'Salin'}
                      </Button>
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">{finalPrompt}</p>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {shots.length > 0 && <Button className="w-full gap-2" onClick={usePrompt}><Check className="h-4 w-4" />Gunakan Prompt di Studio</Button>}
      </CardContent>
    </Card>
  )
}
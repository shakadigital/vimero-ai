'use client'

import { useState } from 'react'
import { generateAudioAction } from '@/lib/actions/video'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Mic, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/utils'

interface AudioContentItem {
  id: string
  title: string
  hook?: string | null
  body?: string | null
  cta?: string | null
  audio_url?: string | null
  subtitle_data?: unknown[] | null
}

interface AudioGeneratorProps {
  businessId: string
  contents: AudioContentItem[]
  selectedContent: string
  audioUrl: string | null
  onSelectContent: (id: string, url: string | null, subtitles: unknown[] | null) => void
  onAudioGenerated: (url: string, subtitles: unknown[] | null) => void
}

export function AudioGenerator({ businessId, contents, selectedContent, audioUrl, onSelectContent, onAudioGenerated }: AudioGeneratorProps) {
  const [voicePersona, setVoicePersona] = useState<string>('dimas')
  const [isLoading, setIsLoading] = useState(false)

  const activeContent = contents.find(c => c.id === selectedContent)

  const handleGenerate = async () => {
    if (!activeContent) return toast.error("Pilih naskah terlebih dahulu")
    
    // Gabungkan hook dan body untuk text-to-speech
    const textToSpeech = `${activeContent.hook || ''}. ${activeContent.body || ''}. ${activeContent.cta || ''}`
    
    if (textToSpeech.trim().length < 10) {
      return toast.error("Naskah terlalu pendek atau kosong")
    }

    setIsLoading(true)
    try {
      const res = await generateAudioAction(businessId, activeContent.id, textToSpeech, voicePersona)
      if (res.success) {
        toast.success("Voiceover berhasil dibuat!")
        onAudioGenerated(res.audioUrl || '', res.subtitles ?? null)
      } else {
        throw new Error(res.error)
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Gagal membuat audio"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>1. Pilih Naskah Konten</Label>
          <Select value={selectedContent} onValueChange={(val: string | null) => {
            if (!val) return;
            const c = contents.find(x => x.id === val)
            onSelectContent(val, c?.audio_url || null, c?.subtitle_data ?? null)
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih naskah yang siap di-generate..." />
            </SelectTrigger>
            <SelectContent>
              {contents.length === 0 ? (
                <SelectItem value="empty" disabled>Tidak ada naskah siap pakai</SelectItem>
              ) : (
                contents.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title ? `${c.title}${c.audio_url ? ' (Sudah ada audio)' : ''}` : 'Tanpa Judul'}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {activeContent && (
          <Card className="bg-muted/50">
            <CardContent className="p-4 text-sm text-muted-foreground line-clamp-3">
              {activeContent.hook} {activeContent.body}
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          <Label>2. Karakter Suara AI</Label>
          <Select value={voicePersona} onValueChange={(val: string | null) => val && setVoicePersona(val)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dimas">🎙️ Dimas (Pria Profesional & Berwibawa)</SelectItem>
              <SelectItem value="siti">🎙️ Siti (Wanita Ramah & Hangat)</SelectItem>
              <SelectItem value="rian">🎙️ Rian (Pria Santai & Enerjik)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button 
        onClick={handleGenerate} 
        disabled={!selectedContent || isLoading}
        className="w-full gap-2 shadow-[0_0_15px_rgba(124,58,237,0.2)] transition-all hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:-translate-y-0.5"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Memproses Audio TTS...
          </>
        ) : (
          <>
            <Mic className="mr-2 h-4 w-4" />
            Generate Voiceover AI
          </>
        )}
      </Button>

      {audioUrl && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex flex-col items-center space-y-4">
            <div className="flex items-center text-primary font-medium">
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Audio Siap Digunakan
            </div>
            <audio src={audioUrl} controls className="w-full h-10" />
            <Button variant="outline" size="sm" className="w-full" onClick={() => window.open(audioUrl, '_blank')}>
              Unduh MP3
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Player } from '@remotion/player'
import { VerticalVideo } from '@/remotion/VerticalVideo'
import { Button } from '@/components/ui/button'
import { Download, Loader2, PlayCircle, ImagePlus } from 'lucide-react'
import { renderVideoAction } from '@/lib/actions/render-video'
import { generateCreativeImage } from '@/lib/actions/studio'
import { toast } from 'sonner'

interface VideoPlayerProps {
  businessId?: string
  audioUrl?: string | null
  subtitleData?: any
  mediaAssets?: any[]
  content?: any
}

export function VideoPlayer({ businessId, audioUrl, subtitleData, mediaAssets, content }: VideoPlayerProps) {
  const [isRendering, setIsRendering] = useState(false)
  const [isGeneratingVisual, setIsGeneratingVisual] = useState(false)
  const [renderedVideoUrl, setRenderedVideoUrl] = useState<string | null>(null)

  // Jika ada data subtitle, hitung durasi dari kata terakhir (Edge TTS format)
  const lastSubtitle = subtitleData && subtitleData.length > 0 ? subtitleData[subtitleData.length - 1] : null;
  const audioDurationMs = lastSubtitle ? (lastSubtitle.offset + lastSubtitle.duration) / 10000 : null;
  
  // Jika tidak ada audio, beri durasi default 300 frame (10 detik)
  // Berikan padding 1 detik (30 frame) setelah kata terakhir agar video tidak langsung terpotong
  const durationInFrames = audioDurationMs ? Math.ceil((audioDurationMs / 1000) * 30) + 30 : (audioUrl ? 900 : 300);

  const handleGenerateVisual = async () => {
    if (!content || !businessId) {
      toast.error("Pilih naskah terlebih dahulu!")
      return
    }
    const textBrief = `${content.hook || ''} ${content.body || ''} ${content.cta || ''}`
    if (textBrief.trim().length < 10) {
      toast.error("Naskah kosong atau terlalu pendek!")
      return
    }

    setIsGeneratingVisual(true)
    toast.info("AI sedang menggambar visual... (Butuh 10-15 detik)")
    try {
      const res = await generateCreativeImage(businessId, content.id, textBrief)
      if (res.success) {
        toast.success("Visual berhasil digambar!")
      }
    } catch(err: any) {
      toast.error(err.message || "Gagal membuat gambar")
    } finally {
      setIsGeneratingVisual(false)
    }
  }

  const handleRender = async () => {
    if (!content) {
      toast.error("Pilih naskah terlebih dahulu!")
      return
    }
    
    setIsRendering(true)
    toast.info("Memulai proses render MP4. Harap tunggu...")
    
    try {
      const res = await renderVideoAction(audioUrl || null, content.title, mediaAssets || [], subtitleData || null)
      
      if (res?.success) {
        toast.success("Video berhasil di-render!")
        setRenderedVideoUrl(res.url!)
      } else {
        toast.error("Gagal merender video: " + res?.error)
      }
    } catch (error: any) {
      toast.error("Terjadi kesalahan: " + error.message)
    } finally {
      setIsRendering(false)
    }
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-4">
      <div className="relative aspect-[9/16] h-[calc(100vh-20rem)] max-h-[720px] w-auto overflow-hidden rounded-2xl border border-white/10 bg-black/60 shadow-[0_0_40px_rgba(0,0,0,0.5)] ring-1 ring-white/5 transition-all duration-500 hover:shadow-[0_0_50px_rgba(236,72,153,0.15)]">
        <Player
          component={VerticalVideo}
          inputProps={{
            audioUrl,
            subtitleData,
            mediaAssets,
            title: content?.title
          }}
          durationInFrames={durationInFrames}
          compositionWidth={1080}
          compositionHeight={1920}
          fps={30}
          controls
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      <div className="mt-8 flex w-full max-w-[320px] flex-col gap-3">
        {renderedVideoUrl ? (
          <>
            <Button className="w-full gap-2 font-semibold transition-all hover:bg-white/10" variant="outline" onClick={() => window.open(renderedVideoUrl, '_blank')}>
              <PlayCircle className="h-4 w-4" />
              Pratinjau Hasil MP4
            </Button>
            <Button className="w-full gap-2 font-semibold bg-accent text-accent-foreground hover:bg-accent/90 shadow-[0_0_15px_rgba(236,72,153,0.3)] transition-all" onClick={() => {
              const a = document.createElement('a');
              a.href = renderedVideoUrl;
              a.download = `Vimero-${content?.title || 'video'}.mp4`;
              a.click();
            }}>
              <Download className="h-4 w-4" />
              Unduh MP4 Asli
            </Button>
          </>
        ) : (
          <div className="flex flex-col gap-3">
            <Button 
              className="w-full gap-2 font-semibold border-primary/50 hover:bg-primary/10 transition-all hover:-translate-y-0.5" 
              variant="outline"
              onClick={handleGenerateVisual} 
              disabled={isGeneratingVisual || !content}
            >
              {isGeneratingVisual ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menggambar Visual AI...
                </>
              ) : (
                <>
                  <ImagePlus className="h-4 w-4" />
                  Buat Visual Latar Belakang
                </>
              )}
            </Button>
            <Button 
              className="w-full gap-2 font-semibold shadow-[0_0_15px_rgba(124,58,237,0.3)] transition-all hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] hover:-translate-y-0.5" 
              onClick={handleRender} 
              disabled={isRendering || isGeneratingVisual || !content}
            >
              {isRendering ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mengekspor MP4... (Bisa &gt;1 Menit)
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Render & Export MP4
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Player } from '@remotion/player'
import { VerticalVideo } from '@/remotion/VerticalVideo'
import { Button } from '@/components/ui/button'
import { Download, Loader2, PlayCircle, ImagePlus, Play, Video as VideoIcon } from 'lucide-react'
import { renderVideoAction } from '@/lib/actions/render-video'
import { generateCreativeImage, generateStockVideo } from '@/lib/actions/studio'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Progress } from '@/components/ui/progress'
import puter from '@heyputer/puter.js'

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
  const [isGeneratingStock, setIsGeneratingStock] = useState(false)
  const [renderProgress, setRenderProgress] = useState(0)
  const [renderStatus, setRenderStatus] = useState<string | null>(null)
  const [renderUrl, setRenderUrl] = useState<string | null>(null)
  const [activeRenderId, setActiveRenderId] = useState<string | null>(null)
  const [tempMedia, setTempMedia] = useState<any>(null)

  const supabase = createClient()

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeRenderId && isRendering) {
      interval = setInterval(async () => {
        const { data, error } = await supabase
          .from('video_renders')
          .select('status, progress, file_url, error_message')
          .eq('id', activeRenderId)
          .single()
          
        if (data) {
          setRenderProgress(data.progress)
          setRenderStatus(data.status)
          
          if (data.status === 'completed') {
            setRenderUrl(data.file_url)
            setIsRendering(false)
            toast.success("Video berhasil di-render!")
            clearInterval(interval)
          } else if (data.status === 'failed') {
            setIsRendering(false)
            toast.error(`Render gagal: ${data.error_message}`)
            clearInterval(interval)
          }
        }
      }, 3000) // Poll every 3 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [activeRenderId, isRendering, supabase])

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

  const handleStockVideo = async () => {
    if (!content || !businessId) {
      toast.error("Pilih naskah terlebih dahulu!")
      return
    }
    const textBrief = `${content.hook || ''} ${content.body || ''} ${content.cta || ''}`
    if (textBrief.trim().length < 10) {
      toast.error("Naskah kosong atau terlalu pendek!")
      return
    }

    setIsGeneratingStock(true)
    toast.info("Mencari video stok yang sesuai... (Butuh beberapa detik)")
    try {
      const res = await generateStockVideo(businessId, content.id, textBrief)
      if (res.success && res.imageUrls) {
        // Karena ada revalidatePath di backend, aset media akan direfresh 
        // secara otomatis saat komponen server dirender ulang.
        // Kita bisa langsung membuang tempMedia dan rely on the revalidation
        setTempMedia(null)
        toast.success("Video stok berhasil ditemukan!")
      }
    } catch(err: any) {
      toast.error(err.message || "Gagal mencari video stok")
    } finally {
      setIsGeneratingStock(false)
    }
  }

  const handleRender = async () => {
    if (!content?.title) {
      toast.error("Pilih naskah terlebih dahulu!")
      return
    }
    
    setIsRendering(true)
    setRenderProgress(0)
    setRenderStatus('pending')
    toast.info("Mengirim tugas render ke antrean...")
    
    try {
      const fullText = content ? `${content.hook || ''} ${content.body || ''} ${content.cta || ''}` : '';
      const res = await renderVideoAction(
        audioUrl || null, 
        content.title, 
        mediaAssets || [], 
        subtitleData || null, 
        fullText,
        businessId,
        content.id,
        content ? {
          hook: content.hook?.length || 0,
          body: content.body?.length || 0,
          cta: content.cta?.length || 0
        } : undefined
      )
      
      if (res?.success && res.renderId) {
        setActiveRenderId(res.renderId)
        toast.success("Proses render dimulai di latar belakang!")
      } else {
        setIsRendering(false)
        toast.error("Gagal memulai render: " + res?.error)
      }
    } catch (error: any) {
      console.error(error)
      setIsRendering(false)
      toast.error("Terjadi kesalahan: " + error.message)
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
            mediaAssets: tempMedia ? [...(mediaAssets || []), tempMedia] : (mediaAssets || []),
            title: content?.title,
            fullText: content ? `${content.hook || ''} ${content.body || ''} ${content.cta || ''}` : '',
            contentSegments: content ? {
              hook: content.hook?.length || 0,
              body: content.body?.length || 0,
              cta: content.cta?.length || 0
            } : undefined
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
        {renderUrl ? (
          <>
            <Button className="w-full gap-2 font-semibold transition-all hover:bg-white/10" variant="outline" onClick={() => window.open(renderUrl, '_blank')}>
              <PlayCircle className="h-4 w-4" />
              Pratinjau Hasil MP4
            </Button>
            <Button className="w-full gap-2 font-semibold bg-accent text-accent-foreground hover:bg-accent/90 shadow-[0_0_15px_rgba(236,72,153,0.3)] transition-all" onClick={() => {
              const a = document.createElement('a');
              a.href = renderUrl;
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
              className="w-full gap-2 font-semibold border-primary/50 hover:bg-primary/10 transition-all hover:-translate-y-0.5" 
              variant="outline"
              onClick={handleStockVideo} 
              disabled={isGeneratingStock || !content}
            >
              {isGeneratingStock ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mencari B-Roll...
                </>
              ) : (
                <>
                  <VideoIcon className="h-4 w-4" />
                  Cari Video B-Roll (Stok)
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

        {/* Render Progress Overlay / Status */}
        {isRendering && (
          <div className="mt-6 p-6 rounded-xl border border-white/10 bg-black/40 backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-white flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-pink-500" />
                Memproses Video ({renderStatus === 'pending' ? 'Menunggu antrean...' : 'Sedang merender...'})
              </h3>
              <span className="text-sm font-bold text-pink-400">{renderProgress}%</span>
            </div>
            <Progress value={renderProgress} className="h-2 bg-white/10" indicatorColor="bg-gradient-to-r from-pink-500 to-violet-500" />
            <p className="text-xs text-muted-foreground mt-3">
              Proses ini berjalan di latar belakang. Anda dapat menutup tab atau berpindah halaman.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

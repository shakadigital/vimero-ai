'use client'

import { useState } from 'react'
import { AudioGenerator } from '@/components/video/audio-generator'
import { VideoPlayer } from '@/components/video/video-player'
import { Headphones, Video } from 'lucide-react'

export function VideoStudioClient({ businessId, contents, mediaAssets, generationHistory = [] }: any) {
  const [activeContentId, setActiveContentId] = useState<string>('')
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [subtitleData, setSubtitleData] = useState<any>(null)

  const handleAudioGenerated = (url: string, subtitles: any) => {
    setAudioUrl(url)
    setSubtitleData(subtitles)
  }

  const handleSelectContent = (id: string, url: string | null, subtitles: any) => {
    setActiveContentId(id)
    setAudioUrl(url)
    setSubtitleData(subtitles)
  }

  const activeContent = contents.find((c: any) => c.id === activeContentId)
  
  // Ambil gambar spesifik untuk naskah ini (jika sudah di-generate)
  const contentImages = generationHistory.filter((h: any) => h.content_id === activeContentId && h.image_url)
  
  // Jika ada gambar spesifik, gunakan. Jika tidak, gunakan mediaAssets global
  const videoMediaAssets = contentImages.length > 0 
    ? contentImages.map((h: any) => ({ file_url: h.image_url }))
    : mediaAssets

  return (
    <div className="flex flex-col lg:flex-row h-full w-full gap-6">
      <div className="glass-panel flex w-full lg:w-1/2 flex-col overflow-y-auto rounded-2xl transition-all duration-300 hover:border-primary/30 hover:shadow-primary/5 p-6">
        <div className="mb-6 flex items-center gap-2 border-b pb-4">
          <Headphones className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">AI Audio Generator</h3>
        </div>
        <AudioGenerator 
          businessId={businessId} 
          contents={contents} 
          selectedContent={activeContentId}
          audioUrl={audioUrl}
          onSelectContent={handleSelectContent}
          onAudioGenerated={handleAudioGenerated}
        />
      </div>

      <div className="glass-panel flex w-full lg:w-1/2 flex-col rounded-2xl transition-all duration-300 hover:border-accent/30 hover:shadow-accent/5 p-6">
        <div className="mb-6 flex items-center gap-2 border-b pb-4">
          <Video className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Video Canvas Engine (9:16)</h3>
        </div>
        <div className="flex flex-1 items-center justify-center bg-muted/30 rounded-lg overflow-hidden">
          <VideoPlayer 
            businessId={businessId}
            audioUrl={audioUrl} 
            subtitleData={subtitleData || activeContent?.subtitle_data}
            mediaAssets={videoMediaAssets}
            content={activeContent}
          />
        </div>
      </div>
    </div>
  )
}

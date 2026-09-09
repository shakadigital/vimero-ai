import { createClient } from '@/lib/supabase/server'
import { VideoStudioClient } from './video-studio-client'
import { PageContainer } from '@/components/dashboard/page-container'

export const metadata = {
  title: 'Studio Video & Audio AI',
  description: 'Hasilkan video vertikal dan voiceover narator AI',
}

interface PageProps {
  params: Promise<{
    businessId: string
  }>
}

export default async function VideoStudioPage({ params }: PageProps) {
  const resolvedParams = await params
  const supabase = await createClient()

  // Ambil naskah dari contents
  const { data: contents } = await supabase
    .from('contents')
    .select('id, title, hook, body, cta, status, audio_url, video_url, subtitle_data')
    .eq('business_id', resolvedParams.businessId)
    .in('status', ['generated', 'review', 'approved_recommended', 'scheduled', 'published'])
    .order('created_at', { ascending: false })

  // Ambil aset gambar/video dari media_assets Creative Studio
  const { data: mediaAssets } = await supabase.from('media_assets')
    .select('*')
    .eq('business_id', resolvedParams.businessId)
    .eq('type', 'generated_image')
    .order('created_at', { ascending: false })

  const { data: generationHistory } = await supabase.from('generation_history')
    .select('*')
    .eq('business_id', resolvedParams.businessId)
    .order('created_at', { ascending: false })

  return (
    <PageContainer
      title="Studio Video & Audio AI"
      description="Ubah naskah Anda menjadi narasi suara profesional dan video vertikal bergaya TikTok/Reels."
    >
      <div className="relative z-10 flex flex-1">
        <VideoStudioClient 
          businessId={resolvedParams.businessId} 
          contents={contents || []} 
          mediaAssets={mediaAssets || []} 
          generationHistory={generationHistory || []}
        />
      </div>
    </PageContainer>
  )
}

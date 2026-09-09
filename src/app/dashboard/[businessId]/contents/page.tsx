import { createClient } from '@/lib/supabase/server'
import { convertIdeaToDraft } from '@/lib/actions/content'
import { Button } from '@/components/ui/button'
import { ContentCard } from './content-card'
import { PageContainer } from '@/components/dashboard/page-container'

export default async function ContentLibraryPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params
  const supabase = await createClient()
  
  // Fetch ideas
  const { data: ideas } = await supabase.from('content_ideas').select('*').eq('business_id', businessId).eq('status', 'pending')
  
  // Fetch contents
  const { data: contents } = await supabase.from('contents').select('*').eq('business_id', businessId).order('created_at', { ascending: false })

  return (
    <PageContainer
      title="Content Factory ✨"
      description="Ubah ide menjadi naskah siap publikasi dengan bantuan kecerdasan buatan."
    >
      
      <div className="max-w-5xl mx-auto space-y-6">
        <h2 className="text-xl font-semibold border-b pb-2">Draft & Naskah Konten</h2>
        <div className="grid gap-6">
          {contents?.map(content => (
            <ContentCard key={content.id} businessId={businessId} content={content} />
          ))}
          {(!contents || contents.length === 0) && (
            <div className="text-center p-8 border border-dashed rounded-xl">
              <p className="text-sm text-muted-foreground">Belum ada draf konten. Tarik ide dari Bank Ide untuk memulai.</p>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}

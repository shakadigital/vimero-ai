import { createClient } from '@/lib/supabase/server'
import { ContentCard } from './content-card'
import { PageContainer } from '@/components/dashboard/page-container'
import { CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react'

export default async function ContentLibraryPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params
  const supabase = await createClient()
  
  // Ambil semua konten KECUALI yang sudah dijadwalkan
  // Asumsi: status 'scheduled' berarti sudah masuk ke Kalender
  const { data: contents } = await supabase
    .from('contents')
    .select('*')
    .eq('business_id', businessId)
    .neq('status', 'scheduled')
    .order('created_at', { ascending: false })

  const approvedContents = contents?.filter(c => c.status === 'approved_recommended') || []
  const needsFixContents = contents?.filter(c => c.status === 'needs_improvement' || c.status === 'generated' || c.status === 'draft') || []

  return (
    <PageContainer
      title="Studio Konten ✨"
      description="Ubah ide menjadi naskah siap publikasi dengan bantuan kecerdasan buatan."
    >
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* SECTION 1: Siap Dijadwalkan */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-semibold">Siap Dijadwalkan</h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-medium ml-2">
              {approvedContents.length} Konten
            </span>
          </div>
          
          <div className="grid gap-6">
            {approvedContents.length > 0 ? (
              approvedContents.map(content => (
                <ContentCard key={content.id} businessId={businessId} content={content} />
              ))
            ) : (
              <div className="text-center p-8 border border-dashed rounded-xl bg-muted/20">
                <p className="text-sm text-muted-foreground">
                  Belum ada konten yang siap. Hasilkan konten dari hasil riset Anda.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 2: Perlu Perhatian */}
        {needsFixContents.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-semibold">Perlu Perhatian</h2>
              <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full font-medium ml-2">
                {needsFixContents.length} Konten
              </span>
            </div>
            
            <div className="grid gap-6">
              {needsFixContents.map(content => (
                <ContentCard key={content.id} businessId={businessId} content={content} />
              ))}
            </div>
          </section>
        )}

      </div>
    </PageContainer>
  )
}


import { createClient } from '@/lib/supabase/server'
import { CalendarCard } from './calendar-card'
import { PageContainer } from '@/components/dashboard/page-container'

export default async function ContentCalendarPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params
  const supabase = await createClient()

  // 1. Fetch konten yang belum terjadwal (antrean)
  // Syarat: status BUKAN draft/idea, dan belum punya scheduled_at
  const { data: queueContents } = await supabase
    .from('contents')
    .select('*')
    .eq('business_id', businessId)
    .in('status', ['generated', 'ai_review', 'approved_recommended', 'needs_improvement'])
    .is('scheduled_at', null)
    .order('updated_at', { ascending: false })

  // 2. Fetch konten yang sudah terjadwal
  // Syarat: status = 'scheduled'
  const { data: scheduledContents } = await supabase
    .from('contents')
    .select('*')
    .eq('business_id', businessId)
    .eq('status', 'scheduled')
    .not('scheduled_at', 'is', null)
    .order('scheduled_at', { ascending: true })

  return (
    <PageContainer
      title="Kalender Konten"
      description="Jadwalkan naskah yang sudah siap ke berbagai platform media sosial."
    >
      <div className="grid lg:grid-cols-2 gap-4 lg:gap-8 items-start">
        {/* KOLOM KIRI: Antrean */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-xl font-semibold">1. Antrean (Belum Terjadwal)</h2>
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full dark:bg-amber-900/50 dark:text-amber-300">
              {queueContents?.length || 0} Konten
            </span>
          </div>
          <div className="grid gap-3 sm:gap-4">
            {queueContents?.map(content => (
              <CalendarCard key={content.id} businessId={businessId} content={content} isScheduled={false} />
            ))}
            {(!queueContents || queueContents.length === 0) && (
              <div className="text-center p-8 border border-dashed rounded-xl bg-muted/20">
                <p className="text-sm text-muted-foreground">Tidak ada konten di antrean.</p>
                <p className="text-xs text-muted-foreground mt-1">Hasilkan atau setujui naskah di Content Factory terlebih dahulu.</p>
              </div>
            )}
          </div>
        </div>

        {/* KOLOM KANAN: Terjadwal */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-xl font-semibold">2. Jadwal Tayang (Upcoming)</h2>
            <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded-full dark:bg-indigo-900/50 dark:text-indigo-300">
              {scheduledContents?.length || 0} Terjadwal
            </span>
          </div>
          <div className="grid gap-3 sm:gap-4">
            {scheduledContents?.map(content => (
              <CalendarCard key={content.id} businessId={businessId} content={content} isScheduled={true} />
            ))}
            {(!scheduledContents || scheduledContents.length === 0) && (
              <div className="text-center p-8 border border-dashed rounded-xl bg-muted/20">
                <p className="text-sm text-muted-foreground">Belum ada konten yang dijadwalkan tayang.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

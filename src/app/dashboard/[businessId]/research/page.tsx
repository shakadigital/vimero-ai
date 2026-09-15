import { createClient } from '@/lib/supabase/server'
import { PageContainer } from '@/components/dashboard/page-container'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ResearchCard } from './research-card'
import { generateResearch } from '@/lib/actions/research'
import { Search, TrendingUp, Users, Target } from 'lucide-react'
import { SubmitButton } from '@/components/auth/submit-button'

export const metadata = {
  title: 'Riset & Strategi - Vimero AI',
  description: 'AI Researcher untuk tren, audiens, dan kompetitor.',
}

export default async function ResearchPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ businessId: string }>,
  searchParams: Promise<{ tab?: string }>
}) {
  const { businessId } = await params
  const resolvedSearchParams = await searchParams
  const currentTab = resolvedSearchParams?.tab || 'trend'

  const supabase = await createClient()

  // Ambil data riset
  const [{ data: researchItems }, { data: pillars }] = await Promise.all([
    supabase
      .from('research_items')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false }),
    supabase
      .from('content_pillars')
      .select('id, name')
      .eq('business_id', businessId)
      .order('created_at', { ascending: true }),
  ])

  const getItemsByType = (type: string) => researchItems?.filter(item => item.type === type) || []

  const trendItems = getItemsByType('trend')
  const competitorItems = getItemsByType('competitor')
  const audienceItems = getItemsByType('audience')
  const keywordItems = getItemsByType('keyword')

  // Bind action dengan businessId
  const generateTrend = generateResearch.bind(null, businessId, 'trend')
  const generateCompetitor = generateResearch.bind(null, businessId, 'competitor')
  const generateAudience = generateResearch.bind(null, businessId, 'audience')
  const generateKeyword = generateResearch.bind(null, businessId, 'keyword')

  return (
    <PageContainer
      title="Riset & Strategi"
      description="Biarkan AI mencari tren pasar, celah kompetitor, dan masalah audiens untuk Anda."
    >
      <Tabs defaultValue={currentTab} className="w-full">
        <TabsList className="mb-4 sm:mb-6">
          <TabsTrigger value="trend" className="gap-2"><TrendingUp className="w-4 h-4"/> Tren Konten</TabsTrigger>
          <TabsTrigger value="competitor" className="gap-2"><Target className="w-4 h-4"/> Kompetitor</TabsTrigger>
          <TabsTrigger value="audience" className="gap-2"><Users className="w-4 h-4"/> Audiens</TabsTrigger>
          <TabsTrigger value="keyword" className="gap-2"><Search className="w-4 h-4"/> Kata Kunci</TabsTrigger>
        </TabsList>

        <TabsContent value="trend">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-xl font-semibold">Laporan Tren Terkini</h2>
            <form action={generateTrend}>
              <SubmitButton pendingText="Meriset...">Mulai Riset Tren Baru</SubmitButton>
            </form>
          </div>
          {trendItems.length === 0 ? (
            <div className="text-center p-12 border border-dashed rounded-lg">
              <p className="text-muted-foreground mb-4">Belum ada riset tren. Klik tombol di atas untuk menyuruh AI mencari tren terkini di industri Anda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {trendItems.map(item => <ResearchCard key={item.id} item={item} pillars={pillars || []} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="competitor">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-xl font-semibold">Analisis Celah Kompetitor</h2>
            <form action={generateCompetitor}>
              <SubmitButton pendingText="Meriset...">Mulai Analisis Kompetitor</SubmitButton>
            </form>
          </div>
          {competitorItems.length === 0 ? (
            <div className="text-center p-12 border border-dashed rounded-lg">
              <p className="text-muted-foreground mb-4">Belum ada analisis kompetitor.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {competitorItems.map(item => <ResearchCard key={item.id} item={item} pillars={pillars || []} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="audience">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-xl font-semibold">Pemahaman Audiens (Pain Points)</h2>
            <form action={generateAudience}>
              <SubmitButton pendingText="Meriset...">Analisis Audiens</SubmitButton>
            </form>
          </div>
          {audienceItems.length === 0 ? (
            <div className="text-center p-12 border border-dashed rounded-lg">
              <p className="text-muted-foreground mb-4">Belum ada laporan audiens.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {audienceItems.map(item => <ResearchCard key={item.id} item={item} pillars={pillars || []} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="keyword">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-xl font-semibold">Riset Kata Kunci & SEO</h2>
            <form action={generateKeyword}>
              <SubmitButton pendingText="Meriset...">Cari Kata Kunci</SubmitButton>
            </form>
          </div>
          {keywordItems.length === 0 ? (
            <div className="text-center p-12 border border-dashed rounded-lg">
              <p className="text-muted-foreground mb-4">Belum ada riset kata kunci.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {keywordItems.map(item => <ResearchCard key={item.id} item={item} pillars={pillars || []} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}

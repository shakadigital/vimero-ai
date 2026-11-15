import { createClient } from '@/lib/supabase/server'
import { PageContainer } from '@/components/dashboard/page-container'
import { PillarsClient } from './pillars-client'

export const metadata = {
  title: 'Pilar & Ide Konten - Vimero AI',
  description: 'Kelola pilar konten dan ide-ide brilian Anda.',
}

interface ContentIdeaRow {
  id: string
  title: string
  description?: string | null
  status: string
  created_at: string
  pillarName?: string
}

interface ContentPillarRow {
  id: string
  name: string
  description?: string | null
  content_ideas?: ContentIdeaRow[] | null
}

export default async function PillarsPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params
  const supabase = await createClient()

  const { data: pillars } = await supabase
    .from('content_pillars')
    .select('*, content_ideas(*)')
    .eq('business_id', businessId)
    .order('created_at', { ascending: true })

  // Ide pending = dari riset (bukan dari bank_ide yang langsung 'converted')
  const typedPillars = (pillars || []) as ContentPillarRow[]
  const pendingIdeas = typedPillars
    .flatMap(p => (p.content_ideas || []).map((idea) => ({ ...idea, pillarName: p.name })))
    .filter((idea) => idea.status === 'pending')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <PageContainer
      title="Pilar & Ide Konten"
      description="Tentukan kategori utama konten Anda dan kumpulkan ide-ide brilian di bawahnya."
    >
      <PillarsClient
        businessId={businessId}
        pillars={pillars || []}
        pendingIdeas={pendingIdeas}
      />
    </PageContainer>
  )
}

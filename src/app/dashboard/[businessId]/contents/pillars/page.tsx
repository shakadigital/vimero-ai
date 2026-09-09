import { createClient } from '@/lib/supabase/server'
import { createPillar, createIdea } from '@/lib/actions/content'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { PageContainer } from '@/components/dashboard/page-container'

export default async function PillarsPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params
  const supabase = await createClient()
  const { data: pillars } = await supabase.from('content_pillars').select('*').eq('business_id', businessId)

  return (
    <PageContainer
      title="Pilar & Ide Konten"
      description="Tentukan kategori utama konten Anda dan kumpulkan ide-ide brilian di bawahnya."
    >
      <div className="border p-6 rounded-xl bg-card shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Buat Pilar Konten Baru</h2>
        <form action={async (formData) => {
          'use server'
          await createPillar(businessId, formData.get('name') as string, formData.get('description') as string)
        }} className="space-y-4 max-w-xl">
          <input name="name" placeholder="Nama Pilar (contoh: Edukasi, Hiburan, Testimoni)" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" required />
          <textarea name="description" placeholder="Deskripsikan tujuan dari pilar ini..." className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" required />
          <Button type="submit">Tambah Pilar</Button>
        </form>
      </div>

      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-transparent border border-primary/20 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5" />
            Kehabisan Ide Konten?
          </h2>
          <p className="text-muted-foreground mt-1">
            Jangan mulai dari nol. Jelajahi perpustakaan kami yang berisi lebih dari 6.000 template ide, hook, dan hashtag teruji.
          </p>
        </div>
        <Link href={`/dashboard/${businessId}/contents/idea-bank`}>
          <Button className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(124,58,237,0.3)] transition-all">
            Jelajahi Bank Ide (6.000+)
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        {pillars?.map(pillar => (
          <div key={pillar.id} className="border p-6 rounded-xl bg-card shadow-sm flex flex-col">
            <h3 className="font-bold text-xl">{pillar.name}</h3>
            <p className="text-sm text-muted-foreground mt-2 mb-6 flex-1">{pillar.description}</p>
            
            <div className="pt-4 border-t border-dashed">
              <h4 className="text-sm font-semibold mb-3">Tanam Ide di Pilar Ini</h4>
              <form action={async (formData) => {
                'use server'
                await createIdea(businessId, pillar.id, formData.get('title') as string, formData.get('description') as string)
              }} className="space-y-3">
                <input name="title" placeholder="Judul Ide (Singkat)" className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" required />
                <textarea name="description" placeholder="Deskripsi/konteks ide..." className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" required />
                <Button type="submit" size="sm" variant="secondary" className="w-full">Simpan Ide</Button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  )
}

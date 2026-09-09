import { createClient } from '@/lib/supabase/server'
import { IdeaBankClient } from './idea-bank-client'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Bank Ide (6.000+) - Vimero AI',
  description: 'Jelajahi ribuan ide konten untuk berbagai niche.',
}

export default async function IdeaBankPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ businessId: string }>,
  searchParams: Promise<{ category?: string }>
}) {
  const { businessId } = await params
  const resolvedSearchParams = await searchParams
  const category = resolvedSearchParams?.category || 'all'
  
  const supabase = await createClient()

  // Ambil semua pilar untuk opsi "Tanam Ide"
  const { data: pillars } = await supabase.from('content_pillars').select('id, name').eq('business_id', businessId)

  let query = supabase.from('content_idea_bank').select('*')
  
  if (category && category !== 'all') {
    query = query.eq('category', category)
  }
  
  const { data: initialIdeas } = await query.limit(500)

  // Daftar kategori (dari nama sheet Excel)
  const categories = [
    'Ide Konten Fashion', 'Ide Konten Skincare', 'Ide Konten Pengembangan Diri', 
    'Ide Konten Kesehatan', 'Idea Kecantikan', 'Idea Finansial', 'Hook Konten', 
    'List Hashtag', '101 QUOTE KATA BIJAK', '101 QUOTE PERCINTAAN', '101 QUOTE KOMEDI', 
    '101 List Tebak-Tebakan Lucu', '101 List This or That', '101 List Pantun', 
    '101 List Konten Galau', '197 UCAPAN HARI RAYA', '101 List Pertanyaan ', 
    '101 List Kalimat Promosi', '101 Ide Konten Soft Selling', '40+ Ide Konten Hard Selling'
  ]

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/${businessId}/contents/pillars`} className="p-2 hover:bg-muted rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bank Ide (6.000+)</h1>
          <p className="text-muted-foreground">Eksplorasi ribuan *template* dan ide siap pakai untuk disalin ke Pilar Anda.</p>
        </div>
      </div>

      <IdeaBankClient 
        businessId={businessId} 
        initialIdeas={initialIdeas || []} 
        categories={categories}
        pillars={pillars || []}
      />
    </div>
  )
}

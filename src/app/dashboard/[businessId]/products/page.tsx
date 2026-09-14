import { PageContainer } from '@/components/dashboard/page-container'
import { createClient } from '@/lib/supabase/server'
import { ProductsClient } from './products-client'

export default async function ProductsPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products_services')
    .select('id, type, name, description, price_info, url')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })

  return (
    <PageContainer
      title="Produk & Penawaran Saya"
      description="Simpan produk atau layanan agar AI memahami apa yang Anda tawarkan."
    >
      <ProductsClient businessId={businessId} initialProducts={products || []} />
    </PageContainer>
  )
}

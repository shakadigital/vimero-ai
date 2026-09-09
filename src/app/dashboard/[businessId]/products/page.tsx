import { PageContainer } from '@/components/dashboard/page-container'

export default function ProductsPage() {
  return (
    <PageContainer
      title="Produk & Layanan"
      description="Kelola daftar produk dan layanan bisnis Anda."
    >
      <div className="rounded-md border p-8 text-center text-muted-foreground bg-card">
        Belum ada produk yang ditambahkan.
      </div>
    </PageContainer>
  )
}

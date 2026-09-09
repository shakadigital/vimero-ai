import { createClient } from '@/lib/supabase/server'
import { generateCreativeImage, deleteCreativeImage } from '@/lib/actions/studio'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { PageContainer } from '@/components/dashboard/page-container'

export default async function CreativeStudioPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params
  const supabase = await createClient()
  
  const { data: history } = await supabase.from('generation_history').select('*').eq('business_id', businessId).order('created_at', { ascending: false })

  return (
    <PageContainer
      title="Creative Studio 🎨"
      description="Studio produksi visual dengan AI Director dan Image Generator (Stable Diffusion)."
    >
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 border p-6 rounded-xl bg-card shadow-sm space-y-4">
          <h2 className="font-semibold text-lg">Buat Gambar Baru</h2>
          <form action={async (formData) => {
            'use server'
            await generateCreativeImage(businessId, null, formData.get('brief') as string)
          }} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Deskripsi / Brief Gambar</label>
              <textarea 
                name="brief" 
                placeholder="Contoh: Foto produk kopi kekinian di atas meja kayu dengan pencahayaan matahari pagi bergaya estetik minimalis." 
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
                required 
              />
            </div>
            <Button type="submit" className="w-full">Generate Image ✨</Button>
            <p className="text-xs text-muted-foreground text-center">Proses menggunakan model Stable Diffusion XL (Cloudflare). Membutuhkan waktu 5-15 detik.</p>
          </form>
        </div>

        <div className="lg:col-span-2 border p-6 rounded-xl bg-card shadow-sm">
          <h2 className="font-semibold text-lg mb-4">Galeri Aset (Generation History)</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {history?.map(item => (
              <div key={item.id} className="space-y-2 group cursor-pointer relative">
                <div className="aspect-square relative rounded-md overflow-hidden border bg-muted">
                  {item.image_url ? (
                    <img src={item.image_url} alt="Generated" className="object-cover w-full h-full transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-xs text-muted-foreground">No Image</div>
                  )}
                  <form action={async () => {
                    'use server'
                    await deleteCreativeImage(businessId, item.id, item.image_url || '')
                  }} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="destructive" type="submit" className="h-8 w-8 rounded-full shadow-md hover:bg-destructive/90 hover:scale-110 transition-all">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
                <p className="text-xs line-clamp-3 text-muted-foreground leading-snug" title={item.prompt}><span className="font-semibold block text-foreground mb-0.5">Prompt:</span>{item.prompt}</p>
              </div>
            ))}
            {(!history || history.length === 0) && (
              <div className="col-span-full text-center p-8 border border-dashed rounded-xl text-muted-foreground">
                Belum ada gambar yang digenerasikan.
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

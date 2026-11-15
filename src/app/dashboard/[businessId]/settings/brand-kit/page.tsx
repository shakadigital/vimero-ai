import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateBrandKit } from '@/lib/actions/brand-kit'
import { SubmitButton } from '@/components/auth/submit-button'
import { PageContainer } from '@/components/dashboard/page-container'

export default async function BrandKitPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params
  const supabase = await createClient()

  const { data: brandKit } = await supabase
    .from('brand_kits')
    .select('*')
    .eq('business_id', businessId)
    .single()

  return (
    <PageContainer
      title="Brand Kit"
      description="Atur identitas merek bisnis Anda agar AI dapat menghasilkan konten yang sesuai."
    >      
      <div className="space-y-6">
        <form action={updateBrandKit}>
          <Card className="max-w-2xl">
            <input type="hidden" name="business_id" value={businessId} />
          <CardHeader>
            <CardTitle>Identitas Merek</CardTitle>
            <CardDescription>Gaya bahasa dan visual utama bisnis Anda.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="primary_color">Warna Utama (Hex)</Label>
              <Input 
                id="primary_color" 
                name="primary_color" 
                defaultValue={brandKit?.primary_color || ''} 
                placeholder="#000000" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tone_of_voice">Gaya Bahasa (Tone of Voice)</Label>
              <Input 
                id="tone_of_voice" 
                name="tone_of_voice" 
                defaultValue={brandKit?.tone_of_voice || ''} 
                placeholder="Contoh: Profesional, Ramah, Inspiratif" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand_personality">Brand Personality</Label>
              <Input 
                id="brand_personality" 
                name="brand_personality" 
                defaultValue={brandKit?.brand_personality || ''} 
                placeholder="Contoh: Sang Bijak, Pahlawan, Kreator" 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="max-w-2xl mt-6">
          <CardHeader>
            <CardTitle>Audience</CardTitle>
            <CardDescription>Siapa target pasar Anda dan apa masalah mereka?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="target_audience">Target Audience</Label>
              <Input 
                id="target_audience" 
                name="target_audience" 
                defaultValue={brandKit?.target_audience || ''} 
                placeholder="Contoh: Mahasiswa, Ibu Rumah Tangga, Pekerja Kantoran" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="audience_problems">Masalah Utama Audience</Label>
              <Input 
                id="audience_problems" 
                name="audience_problems" 
                defaultValue={brandKit?.audience_problems || ''} 
                placeholder="Contoh: Tidak punya waktu luang, Kesulitan mengatur keuangan" 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="max-w-2xl mt-6">
          <CardHeader>
            <CardTitle>Language Rules</CardTitle>
            <CardDescription>Aturan gaya bahasa, kata-kata yang disukai, dan pantangan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="writing_style">Writing Style</Label>
              <Input 
                id="writing_style" 
                name="writing_style" 
                defaultValue={brandKit?.writing_style || ''} 
                placeholder="Contoh: Paragraf pendek, hindari jargon medis" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferred_words">Preferred Words (Pisahkan dengan koma)</Label>
              <Input 
                id="preferred_words" 
                name="preferred_words" 
                defaultValue={brandKit?.preferred_words?.join(', ') || ''} 
                placeholder="Contoh: Eksklusif, Premium, Garansi" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="forbidden_words">Forbidden Words (Pisahkan dengan koma)</Label>
              <Input 
                id="forbidden_words" 
                name="forbidden_words" 
                defaultValue={brandKit?.forbidden_words?.join(', ') || ''} 
                placeholder="Contoh: Murah, Diskon, Jelek" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="forbidden_phrases">Forbidden Phrases (Pisahkan dengan koma)</Label>
              <Input 
                id="forbidden_phrases" 
                name="forbidden_phrases" 
                defaultValue={brandKit?.forbidden_phrases?.join(', ') || ''} 
                placeholder="Contoh: Dijamin sembuh 100%, Terbaik di dunia" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content_boundaries">Content Boundaries (Pisahkan dengan koma)</Label>
              <Input 
                id="content_boundaries" 
                name="content_boundaries" 
                defaultValue={brandKit?.content_boundaries?.join(', ') || ''} 
                placeholder="Contoh: Jangan bahas politik, Jangan merendahkan kompetitor" 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="max-w-2xl mt-6">
          <CardHeader>
            <CardTitle>Voice, Proof &amp; Reel Defaults</CardTitle>
            <CardDescription>Fakta nyata, sudut pandang khas, serta pengaturan default untuk Reel &amp; Caption.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pronouns">Kata Ganti (Pronouns)</Label>
                <Input
                  id="pronouns"
                  name="pronouns"
                  defaultValue={brandKit?.pronouns || 'aku-kamu'}
                  placeholder="Contoh: aku-kamu / saya-Anda"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="speaking_wpm">Kecepatan Bicara (WPM)</Label>
                <Input
                  id="speaking_wpm"
                  name="speaking_wpm"
                  type="number"
                  min={100}
                  max={250}
                  defaultValue={brandKit?.speaking_wpm || 165}
                  placeholder="165"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="proof_points">Fakta &amp; Bukti Nyata (1 baris per fakta)</Label>
              <textarea
                id="proof_points"
                name="proof_points"
                rows={3}
                defaultValue={brandKit?.proof_points?.join('\n') || ''}
                placeholder="Contoh: Digunakan oleh 120+ UMKM kuliner di Jawa Timur"
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand_positions">Sudut Pandang Khas / Positions (1 baris per opini)</Label>
              <textarea
                id="brand_positions"
                name="brand_positions"
                rows={3}
                defaultValue={brandKit?.brand_positions?.join('\n') || ''}
                placeholder="Contoh: Mulai merancang aplikasi dari siapa penggunanya, bukan daftar fitur"
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default_search_terms">Default Search Terms (maks. 4, pisahkan koma)</Label>
              <Input
                id="default_search_terms"
                name="default_search_terms"
                defaultValue={brandKit?.default_search_terms?.join(', ') || ''}
                placeholder="Contoh: otomasi bisnis, aplikasi bisnis, produk digital"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default_hashtags">Default Hashtags (pisahkan koma)</Label>
              <Input
                id="default_hashtags"
                name="default_hashtags"
                defaultValue={brandKit?.default_hashtags?.join(', ') || ''}
                placeholder="Contoh: #otomasibisnis, #aplikasibisnis"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cta_keyword">Default CTA Keyword</Label>
                <Input
                  id="cta_keyword"
                  name="cta_keyword"
                  defaultValue={brandKit?.cta_keyword || ''}
                  placeholder="Contoh: TEMPLATE"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cta_delivers">Yang Didapat User dari CTA</Label>
                <Input
                  id="cta_delivers"
                  name="cta_delivers"
                  defaultValue={brandKit?.cta_delivers || ''}
                  placeholder="Contoh: link template via DM"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-6">
            <SubmitButton pendingText="Menyimpan...">Simpan Perubahan</SubmitButton>
          </CardFooter>
        </Card>
        </form>
      </div>
    </PageContainer>
  )
}

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
          <CardFooter className="pt-6">
            <SubmitButton pendingText="Menyimpan...">Simpan Perubahan</SubmitButton>
          </CardFooter>
        </Card>
        </form>
      </div>
    </PageContainer>
  )
}

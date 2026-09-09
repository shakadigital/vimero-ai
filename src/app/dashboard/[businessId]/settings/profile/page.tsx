import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateBusinessProfile } from '@/lib/actions/business-profile'
import { SubmitButton } from '@/components/auth/submit-button'
import { redirect } from 'next/navigation'
import { PageContainer } from '@/components/dashboard/page-container'

export default async function BusinessProfilePage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params
  const supabase = await createClient()

  const { data: business, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single()

  if (error || !business) {
    redirect('/dashboard')
  }

  return (
    <PageContainer
      title="Profil Bisnis"
      description="Informasi utama bisnis Anda."
    >      <Card className="max-w-2xl">
        <form action={updateBusinessProfile}>
          <input type="hidden" name="business_id" value={businessId} />
          <CardHeader>
            <CardTitle>Informasi Dasar</CardTitle>
            <CardDescription>Nama, industri, dan deskripsi singkat.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Bisnis *</Label>
              <Input 
                id="name" 
                name="name" 
                defaultValue={business.name} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industri</Label>
              <Input 
                id="industry" 
                name="industry" 
                defaultValue={business.industry || ''} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi Singkat</Label>
              <Input 
                id="description" 
                name="description" 
                defaultValue={business.description || ''} 
              />
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton pendingText="Menyimpan...">Simpan Perubahan</SubmitButton>
          </CardFooter>
        </form>
      </Card>
    </PageContainer>
  )
}

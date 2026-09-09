import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Building2, Plus, Sparkles, LogOut } from 'lucide-react'

export default async function DashboardIndex() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: memberships } = await supabase
    .from('business_members')
    .select('business_id, role, businesses(name, industry)')
    .eq('user_id', user.id)

  if (!memberships || memberships.length === 0) {
    redirect('/onboarding')
  }

  if (memberships.length === 1) {
    redirect(`/dashboard/${memberships[0].business_id}`)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/50 bg-card/60 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-extrabold tracking-tight text-lg text-white">VIMERO AI</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground">{user.email}</span>
          <form action="/api/auth/logout" method="POST">
            <Button variant="ghost" size="sm" type="submit" className="text-muted-foreground hover:text-white">
              <LogOut className="h-4 w-4 mr-1.5" />
              Keluar
            </Button>
          </form>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Pilih Ruang Kerja</h1>
          <p className="text-sm text-muted-foreground mt-1">Pilih bisnis atau brand yang ingin Anda kelola hari ini.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {memberships.map((m: any) => (
            <Link key={m.business_id} href={`/dashboard/${m.business_id}`}>
              <Card className="h-full border-border/60 bg-card/70 backdrop-blur hover:border-primary/60 hover:bg-card hover:scale-[1.02] transition-all duration-200 cursor-pointer shadow-lg shadow-black/20 group">
                <CardHeader className="pb-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-white text-lg group-hover:text-primary transition-colors">{m.businesses?.name}</CardTitle>
                  <CardDescription className="text-xs">{m.businesses?.industry || 'Tanpa Kategori'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground flex items-center justify-between pt-2 border-t border-border/40">
                    <span>Peran Akses</span>
                    <span className="capitalize font-semibold text-primary">{m.role}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="pt-4">
          <Link href="/onboarding">
            <Button className="bg-primary hover:bg-primary/90 text-white font-semibold">
              <Plus className="h-4 w-4 mr-2" />
              Buat Bisnis Baru
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}

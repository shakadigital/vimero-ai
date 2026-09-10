import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { cache, Suspense } from 'react'
import { SidebarNav } from '@/components/dashboard/sidebar-nav'
import { Sparkles, Building2, LogOut, ArrowLeftRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import pkg from '../../../../package.json'

const getBusinessLayoutData = cache(async (businessId: string) => {
  const supabase = await createClient()
  const [userResult, membershipResult, businessResult] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('business_members').select('role').eq('business_id', businessId).single(),
    supabase.from('businesses').select('name').eq('id', businessId).single()
  ])
  return {
    user: userResult.data.user,
    membership: membershipResult.data,
    business: businessResult.data
  }
})

import { MobileSidebar } from '@/components/dashboard/mobile-sidebar'

export default async function BusinessLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ businessId: string }>
}) {
  const { businessId } = await params
  const { user, membership, business } = await getBusinessLayoutData(businessId)

  if (!user || !membership) {
    redirect('/dashboard')
  }

  const userInitial = user.email ? user.email.charAt(0).toUpperCase() : 'U'
  const roleLabel = membership.role === 'owner' ? 'Superadmin' : membership.role
  const businessName = business?.name ?? 'Bisnis'

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-background flex-col md:flex-row">
      {/* Mobile Topbar */}
      <header className="md:hidden flex items-center justify-between border-b border-border/40 bg-[#0d0f1f] p-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="font-bold text-white text-sm">VIMERO AI</div>
        </div>
        <MobileSidebar 
          businessId={businessId} 
          businessName={businessName} 
          userEmail={user.email || ''} 
          userRole={membership.role} 
        />
      </header>

      {/* Docked Left Sidebar (Desktop Only) */}
      <aside className="hidden md:flex w-64 md:w-72 h-screen flex-col border-r border-border/50 bg-[#0d0f1f] shrink-0 select-none">
        {/* Top App Branding */}
        <div className="p-5 border-b border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="font-black tracking-tight text-base text-white flex items-center gap-1.5">
                VIMERO AI
              </div>
              <div className="text-[11px] text-muted-foreground font-medium">
                Command Center
              </div>
            </div>
          </div>
        </div>

        {/* Active Business Switcher Card */}
        <div className="px-4 py-3">
          <div className="bg-[#151833] border border-border/50 rounded-xl p-3 flex items-center justify-between group hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-7 w-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Bisnis Aktif</p>
                <p className="text-xs font-bold text-white truncate">{businessName}</p>
              </div>
            </div>
            <Link href="/dashboard" title="Ganti Ruang Kerja" className="text-muted-foreground hover:text-white p-1 rounded hover:bg-white/5 transition-colors">
              <ArrowLeftRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Navigation Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
          <SidebarNav businessId={businessId} />
        </div>

        {/* Bottom User Profile Card */}
        <div className="p-3 border-t border-border/40 bg-[#0a0c18]">
          <div className="bg-[#141731] border border-border/40 rounded-xl p-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-md">
                {userInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate" title={user.email}>
                  {user.email}
                </p>
                <p className="text-[10px] text-muted-foreground capitalize font-medium">
                  {roleLabel}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-border/30 flex items-center justify-between">
              <form action="/api/auth/logout" method="POST" className="w-full">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 py-1.5 px-3 rounded-lg transition-colors font-semibold"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Keluar
                </button>
              </form>
            </div>
          </div>
          <div className="text-[10px] text-center text-muted-foreground/60 mt-2 font-mono">
            VIMERO v{pkg.version}
          </div>
        </div>
      </aside>

      {/* Main Content View (Full Width & Scrollable) */}
      <main className="flex-1 overflow-y-auto bg-background md:h-screen">
        <Suspense fallback={
          <div className="flex h-full w-full items-center justify-center min-h-[50vh]">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-sm font-medium">Memuat data...</span>
            </div>
          </div>
        }>
          {children}
        </Suspense>
      </main>
    </div>
  )
}

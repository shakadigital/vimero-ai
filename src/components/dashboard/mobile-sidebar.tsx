'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, Sparkles, Building2, LogOut, ArrowLeftRight } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { SidebarNav } from '@/components/dashboard/sidebar-nav'
import { Button } from '@/components/ui/button'

interface MobileSidebarProps {
  businessId: string
  businessName: string
  userEmail: string
  userRole: string
}

export function MobileSidebar({ businessId, businessName, userEmail, userRole }: MobileSidebarProps) {
  const [open, setOpen] = useState(false)
  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : 'U'
  const roleLabel = userRole === 'owner' ? 'Superadmin' : userRole

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground hover:text-white">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 bg-[#0d0f1f] border-r-border/50 flex flex-col h-full text-foreground">
        <SheetTitle className="sr-only">Menu Navigasi Mobile</SheetTitle>
        {/* Top App Branding */}
        <div className="p-5 border-b border-border/40 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
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

        {/* Active Business Switcher Card */}
        <div className="px-4 py-3">
          <div className="bg-[#151833] border border-border/50 rounded-xl p-3 flex items-center justify-between group">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-7 w-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Bisnis Aktif</p>
                <p className="text-xs font-bold text-white truncate">{businessName}</p>
              </div>
            </div>
            <Link 
              href="/dashboard" 
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-white p-1 rounded hover:bg-white/5 transition-colors"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-2 custom-scrollbar px-2" onClick={(e) => {
          // Close sidebar when clicking a link inside SidebarNav
          if ((e.target as HTMLElement).closest('a')) {
            setOpen(false)
          }
        }}>
          <SidebarNav businessId={businessId} />
        </div>

        {/* Bottom User Profile */}
        <div className="p-3 border-t border-border/40 bg-[#0a0c18]">
          <div className="bg-[#141731] border border-border/40 rounded-xl p-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-md">
                {userInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate" title={userEmail}>
                  {userEmail}
                </p>
                <p className="text-[10px] text-muted-foreground capitalize font-medium">
                  {roleLabel}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-border/30">
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
        </div>
      </SheetContent>
    </Sheet>
  )
}

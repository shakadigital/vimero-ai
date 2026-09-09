'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Lightbulb,
  FileEdit,
  Wand2,
  Calendar,
  Target,
  Package,
  Building2,
  Palette,
  ChevronRight,
  Video
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

interface SidebarNavProps {
  businessId: string
}

export function SidebarNav({ businessId }: SidebarNavProps) {
  const pathname = usePathname()
  const basePath = `/dashboard/${businessId}`

  const mainNavItems: NavItem[] = [
    { href: '', label: 'Dashboard Utama', icon: LayoutDashboard },
    { href: '/research', label: 'Riset & Strategi', icon: Target },
    { href: '/contents/pillars', label: 'Pilar & Ide Konten', icon: Lightbulb },
    { href: '/contents', label: 'Studio Konten', icon: FileEdit, badge: 'AI' },
    { href: '/video', label: 'Studio Video & Audio', icon: Video, badge: 'NEW/PRO' },
    { href: '/studio', label: 'Creative Studio', icon: Wand2 },
    { href: '/calendar', label: 'Kalender Konten', icon: Calendar },
  ]

  const businessNavItems: NavItem[] = [
    { href: '/goals', label: 'Target & Goals', icon: Target },
    { href: '/products', label: 'Produk & Layanan', icon: Package },
    { href: '/settings/brand-kit', label: 'Brand Kit', icon: Palette },
    { href: '/settings/profile', label: 'Profil Bisnis', icon: Building2 },
  ]

  const isActive = (itemHref: string) => {
    const fullHref = itemHref === '' ? basePath : `${basePath}${itemHref}`
    if (itemHref === '') {
      return pathname === basePath
    }
    return pathname.startsWith(fullHref)
  }

  return (
    <div className="flex flex-col gap-6 px-3 py-2">
      <div>
        <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/70">
          Menu Utama
        </div>
        <nav className="flex flex-col gap-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            const targetUrl = item.href === '' ? basePath : `${basePath}${item.href}`

            return (
              <Link
                key={item.href}
                href={targetUrl}
                className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-primary/20 text-white font-semibold shadow-sm border border-primary/30'
                    : 'text-muted-foreground hover:bg-card/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      active ? 'text-primary' : 'text-muted-foreground group-hover:text-white'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                    active ? 'bg-primary text-white' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      <div>
        <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/70">
          Manajemen Bisnis
        </div>
        <nav className="flex flex-col gap-1">
          {businessNavItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            const targetUrl = `${basePath}${item.href}`

            return (
              <Link
                key={item.href}
                href={targetUrl}
                className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-primary/20 text-white font-semibold shadow-sm border border-primary/30'
                    : 'text-muted-foreground hover:bg-card/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      active ? 'text-primary' : 'text-muted-foreground group-hover:text-white'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-60 transition-opacity text-muted-foreground" />
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

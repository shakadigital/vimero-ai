import { Suspense } from 'react'
import { KpiCards } from '@/components/dashboard/kpi-cards'
import { PerformanceChart } from '@/components/dashboard/performance-chart'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { GoalsOverview } from '@/components/dashboard/goals-overview'
import { ContentStatus } from '@/components/dashboard/content-status'
import { createClient } from '@/lib/supabase/server'
import { PageContainer } from '@/components/dashboard/page-container'

export default async function BusinessIndexPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params
  const supabase = await createClient()

  const [businessResult, userResult] = await Promise.all([
    supabase.from('businesses').select('name, industry').eq('id', businessId).single(),
    supabase.auth.getUser()
  ])

  const business = businessResult.data
  const user = userResult.data.user
  const displayName = user?.email?.split('@')[0] || 'User'

  // Format tanggal Indonesia persis seperti di Smart Farm (Selasa, 8 September 2026)
  const today = new Date()
  const dateStr = today.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return (
    <PageContainer
      title="Dashboard Utama"
      description={
        <>Selamat datang kembali, <span className="text-white font-medium capitalize">{displayName}</span>! Kelola performa <span className="text-primary font-semibold">{business?.name || 'Bisnis Anda'}</span>.</>
      }
      action={
        <div className="bg-[#151833] border border-[#272c5c] text-slate-200 text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-2.5 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span>{dateStr}</span>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Row 1: 4 KPI Cards */}
      <Suspense fallback={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-[#151833]/60 animate-pulse rounded-2xl border border-[#23274e]" />
          ))}
        </div>
      }>
        <KpiCards businessId={businessId} />
      </Suspense>

      {/* Row 2: Performance Chart (Left 8 cols) & Recent Activity (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-8">
          <PerformanceChart />
        </div>
        <div className="lg:col-span-4">
          <Suspense fallback={
            <div className="h-full min-h-[320px] bg-[#151833]/60 animate-pulse rounded-2xl border border-[#23274e]" />
          }>
            <RecentActivity businessId={businessId} />
          </Suspense>
        </div>
      </div>

      {/* Row 3: Pipeline Status & Business Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        <Suspense fallback={
          <div className="h-64 bg-[#151833]/60 animate-pulse rounded-2xl border border-[#23274e]" />
        }>
          <ContentStatus businessId={businessId} />
        </Suspense>

        <Suspense fallback={
          <div className="h-64 bg-[#151833]/60 animate-pulse rounded-2xl border border-[#23274e]" />
        }>
          <GoalsOverview businessId={businessId} />
        </Suspense>
      </div>
      </div>
    </PageContainer>
  )
}

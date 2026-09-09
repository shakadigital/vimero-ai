import { createClient } from '@/lib/supabase/server'
import { Target, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export async function GoalsOverview({ businessId }: { businessId: string }) {
  const supabase = await createClient()

  const { data: goals } = await supabase
    .from('business_goals')
    .select('id, title, status')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(4)

  const statusStyles: Record<string, { bg: string; text: string; border: string; label: string }> = {
    active: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', label: 'Aktif' },
    completed: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', label: 'Selesai' },
    archived: { bg: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-500/20', label: 'Arsip' },
  }

  return (
    <div className="rounded-2xl bg-[#151833] border border-[#23274e] p-6 shadow-lg shadow-black/20 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base lg:text-lg font-bold text-white">Target & Tujuan Bisnis</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Fokus pertumbuhan yang sedang dikejar.</p>
          </div>
          <Link
            href={`/dashboard/${businessId}/goals`}
            className="text-xs text-primary hover:text-primary/80 font-semibold flex items-center gap-1 transition-colors"
          >
            Atur Target <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {(!goals || goals.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-8 text-center rounded-xl bg-[#1c2042]/50 border border-dashed border-[#272c5c]">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
              <Target className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-white">Belum ada target yang dibuat</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Buat target pertama untuk menyelaraskan ide konten AI.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {goals.map((goal) => {
              const style = statusStyles[goal.status] || statusStyles.active
              return (
                <div
                  key={goal.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#1c2042] border border-[#272c5c] hover:bg-[#20254e] transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 shrink-0 shadow-sm" />
                    <span className="text-xs font-semibold text-white truncate max-w-[220px]">
                      {goal.title}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${style.bg} ${style.text} ${style.border} shrink-0`}>
                    {style.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { FileText, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export async function ContentStatus({ businessId }: { businessId: string }) {
  const supabase = await createClient()

  const { data: contents } = await supabase
    .from('contents')
    .select('id, title, status, updated_at')
    .eq('business_id', businessId)
    .order('updated_at', { ascending: false })
    .limit(4)

  const statusConfig: Record<string, { dot: string; badge: string; label: string }> = {
    draft: { dot: 'bg-amber-400', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'Draf' },
    generated: { dot: 'bg-indigo-400', badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', label: 'Generated' },
    needs_improvement: { dot: 'bg-rose-400', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20', label: 'Revisi' },
    approved_recommended: { dot: 'bg-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'Disetujui' },
    scheduled: { dot: 'bg-blue-400', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20', label: 'Terjadwal' },
    published: { dot: 'bg-purple-400', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20', label: 'Terbit' },
  }

  return (
    <div className="rounded-2xl bg-[#151833] border border-[#23274e] p-6 shadow-lg shadow-black/20 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base lg:text-lg font-bold text-white">Status Pipeline Konten</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Konten terkini di Content Factory.</p>
          </div>
          <Link
            href={`/dashboard/${businessId}/contents`}
            className="text-xs text-primary hover:text-primary/80 font-semibold flex items-center gap-1 transition-colors"
          >
            Lihat Semua <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        
        {(!contents || contents.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-8 text-center rounded-xl bg-[#1c2042]/50 border border-dashed border-[#272c5c]">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
              <FileText className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-white">Belum ada konten yang dibuat</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Mulai racik konten pertama dengan AI di Studio Konten.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {contents.map((content) => {
              const config = statusConfig[content.status] || {
                dot: 'bg-zinc-400',
                badge: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
                label: content.status,
              }
              const date = new Date(content.updated_at)
              return (
                <div
                  key={content.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#1c2042] border border-[#272c5c] hover:bg-[#20254e] transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`h-2 w-2 rounded-full ${config.dot} shrink-0 shadow-sm`} />
                    <span className="text-xs font-semibold text-white truncate max-w-[220px]">
                      {content.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${config.badge}`}>
                      {config.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground hidden sm:inline">
                      {date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

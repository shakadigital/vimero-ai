import { createClient } from '@/lib/supabase/server'
import { Activity, Sparkles, FileText, CheckCircle2, Clock } from 'lucide-react'
import Link from 'next/link'

export async function RecentActivity({ businessId }: { businessId: string }) {
  const supabase = await createClient()

  // Ambil audit logs jika ada
  const { data: logs } = await supabase
    .from('audit_logs')
    .select('id, action, entity_type, created_at')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(4)

  // Ambil konten terbaru jika tidak ada audit log
  const { data: recentContents } = await supabase
    .from('contents')
    .select('id, title, channel, status, updated_at')
    .eq('business_id', businessId)
    .order('updated_at', { ascending: false })
    .limit(4)

  // Default fallback activities matching Smart Farm aesthetics
  const defaultActivities = [
    {
      id: '1',
      title: 'Ruang Kerja Diinisialisasi',
      channel: 'Sistem VIMERO',
      time: 'Hari ini, 23:45',
      icon: Sparkles,
      iconBg: 'bg-indigo-600 text-white',
    },
    {
      id: '2',
      title: 'Setup Brand Kit & Persona',
      channel: 'Konfigurasi Brand',
      time: 'Hari ini, 23:48',
      icon: FileText,
      iconBg: 'bg-blue-600 text-white',
    },
    {
      id: '3',
      title: 'AI Engine Terhubung',
      channel: 'DeepSeek / OpenAI',
      time: 'Hari ini, 23:50',
      icon: Activity,
      iconBg: 'bg-emerald-600 text-white',
    },
  ]

  const hasDbActivities = (logs && logs.length > 0) || (recentContents && recentContents.length > 0)

  return (
    <div className="rounded-2xl bg-[#151833] border border-[#23274e] p-6 shadow-lg shadow-black/20 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base lg:text-lg font-bold text-white">Aktivitas Terakhir</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Jejak eksekusi dan pembaruan AI.</p>
          </div>
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" title="Sistem Aktif" />
        </div>

        <div className="space-y-3">
          {hasDbActivities ? (
            // Render real database logs or recent contents
            (logs && logs.length > 0) ? (
              logs.map((log) => {
                const date = new Date(log.created_at)
                const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                const dateStr = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                return (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-[#1c2042] border border-[#272c5c] hover:bg-[#20254e] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
                        <Activity className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{log.action}</p>
                        <p className="text-[11px] text-muted-foreground capitalize truncate">
                          {log.entity_type} • VIMERO Core
                        </p>
                      </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground whitespace-nowrap pl-2">
                      {dateStr}, {timeStr}
                    </div>
                  </div>
                )
              })
            ) : (
              recentContents?.map((c) => {
                const date = new Date(c.updated_at)
                const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-[#1c2042] border border-[#272c5c] hover:bg-[#20254e] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{c.title}</p>
                        <p className="text-[11px] text-muted-foreground capitalize truncate">
                          {c.channel || 'Sosial Media'} • <span className="text-primary font-semibold">{c.status}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground whitespace-nowrap pl-2">
                      {timeStr}
                    </div>
                  </div>
                )
              })
            )
          ) : (
            // Default smart activities matching Smart Farm layout
            defaultActivities.map((act) => {
              const Icon = act.icon
              return (
                <div
                  key={act.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#1c2042] border border-[#272c5c] hover:bg-[#20254e] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-9 w-9 rounded-xl ${act.iconBg} flex items-center justify-center shrink-0 shadow-md`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{act.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{act.channel}</p>
                    </div>
                  </div>
                  <div className="text-[10px] text-muted-foreground whitespace-nowrap pl-2">
                    {act.time}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <div className="pt-4 mt-2 border-t border-[#23274e]/60">
        <Link
          href={`/dashboard/${businessId}/contents`}
          className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold border border-primary/20 transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Buka Studio Konten
        </Link>
      </div>
    </div>
  )
}

'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { CheckCircle2, Clock3, ExternalLink, Loader2, RefreshCw, Trash2, Video, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Progress } from '@/components/ui/progress'
import { deleteVideoRenderAction } from '@/lib/actions/render-video'

interface VideoRender {
  id: string
  content_id: string | null
  status: string
  progress: number
  file_url: string | null
  error_message: string | null
  created_at: string
  is_stale?: boolean
  content?: { title: string | null } | null
}

interface VideoRenderOverviewProps {
  businessId: string
  initialRenders: VideoRender[]
}

function statusLabel(status: string) {
  if (status === 'completed') return 'Selesai'
  if (status === 'failed') return 'Gagal'
  if (status === 'pending') return 'Menunggu'
  return 'Sedang diproses'
}

export function VideoRenderOverview({ businessId, initialRenders }: VideoRenderOverviewProps) {
  const [renders, setRenders] = useState(initialRenders)
  const [isDeleting, startDeleting] = useTransition()
  const supabase = createClient()

  const refreshRenders = useCallback(async () => {
    const { data } = await supabase
      .from('video_renders')
      .select('id, content_id, status, progress, file_url, error_message, created_at, contents(title)')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .limit(6)

    if (data) {
      setRenders(data.map((render) => ({
        ...render,
        is_stale: ['pending', 'rendering'].includes(render.status) && Date.now() - new Date(render.created_at).getTime() > 10 * 60 * 1000,
        content: Array.isArray(render.contents) ? render.contents[0] || null : render.contents
      })) as VideoRender[])
    }
  }, [businessId, supabase])

  useEffect(() => {
    const interval = window.setInterval(refreshRenders, 5000)
    return () => window.clearInterval(interval)
  }, [refreshRenders])

  const handleDelete = (renderId: string) => {
    startDeleting(async () => {
      try {
        await deleteVideoRenderAction(businessId, renderId)
        await refreshRenders()
      } catch (error) {
        console.error('Gagal menghapus render:', error)
      }
    })
  }

  const completedCount = renders.filter((render) => render.status === 'completed').length
  const processingCount = renders.filter((render) => ['pending', 'rendering'].includes(render.status)).length
  const failedCount = renders.filter((render) => render.status === 'failed').length

  return (
    <section className="rounded-2xl bg-[#151833] border border-[#23274e] p-5 sm:p-6 shadow-lg shadow-black/20">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-base lg:text-lg font-bold text-white flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            Status Video
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Pantau render tanpa membuka Studio Video.</p>
        </div>
        <Link href={`/dashboard/${businessId}/video`} className="text-xs font-semibold text-primary hover:text-primary/80 inline-flex items-center gap-1">
          Buka Studio <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
          <p className="text-[10px] uppercase tracking-wide text-emerald-300">Selesai</p>
          <p className="text-2xl font-black text-white mt-1">{completedCount}</p>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
          <p className="text-[10px] uppercase tracking-wide text-amber-300">Proses</p>
          <p className="text-2xl font-black text-white mt-1">{processingCount}</p>
        </div>
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3">
          <p className="text-[10px] uppercase tracking-wide text-red-300">Gagal</p>
          <p className="text-2xl font-black text-white mt-1">{failedCount}</p>
        </div>
      </div>

      {renders.length === 0 ? (
        <div className="border border-dashed border-[#30365f] rounded-xl p-6 text-center text-sm text-muted-foreground">
          Belum ada video yang dirender.
        </div>
      ) : (
        <div className="space-y-3">
          {renders.slice(0, 4).map((render) => {
            const isProcessing = ['pending', 'rendering'].includes(render.status)
            const isStale = Boolean(render.is_stale)
            const title = render.content?.title || 'Video tanpa judul'

            return (
              <div key={render.id} className="rounded-xl border border-[#292f59] bg-[#10132b]/70 p-3 sm:p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-white truncate">{title}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                      {render.status === 'completed' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                      {isProcessing && <Loader2 className="h-3.5 w-3.5 text-amber-400 animate-spin" />}
                      {(render.status === 'failed' || isStale) && <XCircle className="h-3.5 w-3.5 text-red-400" />}
                      {render.status === 'pending' && <Clock3 className="h-3.5 w-3.5 text-amber-400" />}
                      {isStale ? 'Macet' : statusLabel(render.status)}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    {render.status === 'completed' && render.file_url && (
                      <a href={render.file_url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary hover:text-primary/80 inline-flex items-center gap-1">
                        Preview <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {render.content_id && (render.status === 'failed' || isStale) && (
                      <Link href={`/dashboard/${businessId}/video?contentId=${render.content_id}`} className="text-xs font-semibold text-amber-300 hover:text-amber-200 inline-flex items-center gap-1">
                        <RefreshCw className="h-3.5 w-3.5" /> Buat ulang
                      </Link>
                    )}
                    <button type="button" onClick={() => handleDelete(render.id)} disabled={isDeleting} className="text-muted-foreground hover:text-red-300 disabled:opacity-50" aria-label="Hapus render">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {isProcessing && !isStale && (
                  <div className="mt-3 flex items-center gap-3">
                    <Progress value={render.progress} className="h-1.5 bg-white/10" indicatorColor="bg-gradient-to-r from-amber-400 to-primary" />
                    <span className="text-[11px] font-bold text-amber-300 min-w-8 text-right">{render.progress}%</span>
                  </div>
                )}

                {(render.status === 'failed' || isStale) && (
                  <p className="text-xs text-red-300 mt-2">{isStale ? 'Render tidak berubah lebih dari 10 menit. Hapus lalu buat ulang.' : render.error_message}</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

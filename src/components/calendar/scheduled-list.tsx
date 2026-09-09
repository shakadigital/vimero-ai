'use client'

import { useState } from 'react'
import { Clock, Rocket, Trash2, CheckCircle2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PostPreviewModal, type PostContentData } from './post-preview-modal'

interface ScheduledListProps {
  businessId: string
  businessName: string
  scheduled: PostContentData[]
  onPublish: (contentId: string) => Promise<void>
  onUnschedule: (contentId: string) => Promise<void>
}

export function ScheduledList({
  businessId,
  businessName,
  scheduled,
  onPublish,
  onUnschedule,
}: ScheduledListProps) {
  const [selectedContent, setSelectedContent] = useState<PostContentData | null>(null)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  return (
    <div className="space-y-3">
      {scheduled?.map((content) => {
        const date = content.scheduled_at ? new Date(content.scheduled_at) : null
        const isPublished = content.status === 'published'

        return (
          <div
            key={content.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#171a35] border border-[#262a56] hover:border-primary/40 transition-all group cursor-pointer"
            onClick={() => setSelectedContent(content)}
          >
            <div className="min-w-0 space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    isPublished
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                  }`}
                >
                  {isPublished ? 'PUBLISHED' : 'SCHEDULED'}
                </span>
                <span className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1">
                  📍 {content.platform || 'Instagram'}
                </span>
              </div>

              <h3 className="font-bold text-sm text-white truncate max-w-md group-hover:text-primary transition-colors">
                {content.title}
              </h3>

              {date && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  {date.toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  WIB
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
              {/* Tombol Pratinjau Postingan */}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setSelectedContent(content)}
                className="bg-[#20254e] hover:bg-[#282e60] text-slate-200 border-[#31376c] text-xs font-semibold gap-1.5 h-8"
              >
                <Eye className="h-3.5 w-3.5 text-primary" />
                Lihat Pratinjau
              </Button>

              {content.status === 'scheduled' && (
                <>
                  <Button
                    type="button"
                    size="sm"
                    disabled={loadingAction === content.id}
                    onClick={async () => {
                      setLoadingAction(content.id)
                      try {
                        await onPublish(content.id)
                      } finally {
                        setLoadingAction(null)
                      }
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1.5 shadow-md shadow-emerald-600/20 text-xs h-8"
                  >
                    <Rocket className="h-3.5 w-3.5" />
                    {loadingAction === content.id ? 'Memproses...' : 'Publish Sekarang'}
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    title="Batalkan Jadwal"
                    disabled={loadingAction === content.id}
                    onClick={async () => {
                      setLoadingAction(content.id)
                      try {
                        await onUnschedule(content.id)
                      } finally {
                        setLoadingAction(null)
                      }
                    }}
                    className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 p-2 h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}

              {isPublished && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold px-2 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Sudah Tayang
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* Pratinjau Modal */}
      <PostPreviewModal
        content={selectedContent}
        onClose={() => setSelectedContent(null)}
        businessName={businessName}
      />
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { deleteContent, scheduleContent, unscheduleContent } from '@/lib/actions/content'
import { toast } from 'sonner'
import { Calendar, Clock, Loader2, Trash2, X, ChevronDown, ChevronUp } from 'lucide-react'
import { getErrorMessage } from '@/lib/utils'

interface CalendarContentItem {
  id: string
  title: string
  platform?: string | null
  scheduled_at?: string | null
  hook?: string | null
  body?: string | null
}

export function CalendarCard({ businessId, content, isScheduled = false }: { businessId: string, content: CalendarContentItem, isScheduled?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [platform, setPlatform] = useState(content.platform || 'instagram')
  const [scheduledAt, setScheduledAt] = useState(content.scheduled_at ? new Date(content.scheduled_at).toISOString().slice(0, 16) : '')
  const [isLoading, setIsLoading] = useState(false)

  const handleSchedule = async () => {
    if (!scheduledAt) {
      toast.error('Pilih tanggal dan waktu tayang terlebih dahulu')
      return
    }

    setIsLoading(true)
    try {
      // Convert local datetime to UTC for database
      const utcDate = new Date(scheduledAt).toISOString()
      await scheduleContent(businessId, content.id, utcDate, platform)
      toast.success('Konten berhasil dijadwalkan!')
    } catch (error: unknown) {
      toast.error('Gagal menjadwalkan: ' + getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnschedule = async () => {
    setIsLoading(true)
    try {
      await unscheduleContent(businessId, content.id)
      toast.success('Jadwal dibatalkan, dikembalikan ke antrean.')
    } catch (error: unknown) {
      toast.error('Gagal membatalkan jadwal: ' + getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Hapus naskah ini dari antrean? Jika berasal dari Idea Bank, idenya akan dikembalikan ke antrean.')) return

    setIsLoading(true)
    try {
      await deleteContent(businessId, content.id)
      toast.success('Naskah berhasil dihapus dari antrean.')
    } catch (error: unknown) {
      toast.error('Gagal menghapus naskah: ' + getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  // Format date for display if scheduled
  const displayDate = content.scheduled_at 
    ? new Date(content.scheduled_at).toLocaleString('id-ID', {
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : ''

  return (
    <div className={`border rounded-xl shadow-sm transition-all duration-200 ${isScheduled ? 'bg-indigo-50/30 border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900' : 'bg-card hover:border-primary/30'}`}>
      {/* HEADER (Clickable to expand) */}
      <div 
        className="flex justify-between items-start gap-3 sm:gap-4 p-3 sm:p-4 cursor-pointer hover:bg-muted/30 rounded-t-xl transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1">
          <h3 className="font-bold text-base leading-tight group-hover:text-primary transition-colors flex items-center gap-2">
            {content.title}
            {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </h3>
        </div>
        <div>
          {isScheduled ? (
            <span className="text-xs px-2 py-1 rounded-full font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 whitespace-nowrap flex items-center gap-1">
              <Clock className="w-3 h-3" /> Scheduled
            </span>
          ) : (
            <span className="text-xs px-2 py-1 rounded-full font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 whitespace-nowrap">
              Queue
            </span>
          )}
        </div>
      </div>

      {/* EXPANDABLE CONTENT PREVIEW */}
      {isExpanded && (
        <div className="px-3 pb-3 sm:px-4 sm:pb-4 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="space-y-2 text-sm bg-muted/30 p-3 rounded-lg border">
            {content.hook && <p><strong className="text-primary">Hook:</strong> {content.hook}</p>}
            {content.body && <p className="text-muted-foreground leading-relaxed">{content.body}</p>}
          </div>
        </div>
      )}

      {/* SCHEDULING FORM */}
      <div className="p-3 pt-0 sm:p-4 sm:pt-0">
        {isScheduled ? (
        <div className="space-y-3">
          <div className="bg-background border rounded-lg p-3 flex items-center gap-3">
            <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-full text-indigo-600 dark:text-indigo-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">{content.platform}</p>
              <p className="text-sm font-medium">{displayDate}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200" 
            onClick={handleUnschedule}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <X className="w-4 h-4 mr-2" />}
            Batalkan Jadwal
          </Button>
        </div>
      ) : (
        <div className="space-y-3 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
            Hapus dari Antrean
          </Button>
          <div>
            <label className="text-[11px] sm:text-xs font-semibold text-muted-foreground mb-1 block">Platform Tujuan:</label>
            <select 
              className="w-full text-xs sm:text-sm rounded-md border border-input bg-background px-3 py-1.5 sm:py-2"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            >
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="facebook">Facebook</option>
              <option value="linkedin">LinkedIn</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] sm:text-xs font-semibold text-muted-foreground mb-1 block">Tanggal & Waktu Tayang:</label>
            <input 
              type="datetime-local" 
              className="w-full text-xs sm:text-sm rounded-md border border-input bg-background px-3 py-1.5 sm:py-2"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>
          <Button 
            size="sm" 
            className="w-full gap-2 mt-2" 
            onClick={handleSchedule}
            disabled={isLoading || !scheduledAt}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
            Jadwalkan Konten
          </Button>
        </div>
      )}
    </div>
  </div>
  )
}

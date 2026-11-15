'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { reviseContentWithAI, saveManualEdit, deleteContent, scheduleContent } from '@/lib/actions/content'
import { Loader2, Wand2, Edit3, Save, X, AlertTriangle, RefreshCw, CheckCircle2, Calendar, Video, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { getErrorMessage } from '@/lib/utils'
import { lintCaption } from '@/lib/ai/quality/caption-linter'

interface ContentItem {
  id: string
  title: string
  status: string
  hook?: string | null
  body?: string | null
  cta?: string | null
  hashtags?: string[] | null
  ai_score?: number | null
  ai_feedback?: string | null
  ai_claim_warnings?: string[] | null
}

// Fungsi untuk menyorot teks bermasalah berdasarkan kritik AI
function highlightProblematicText(text: string, feedback?: string | null, warnings?: string[] | null) {
  if (!text || (!feedback && (!warnings || warnings.length === 0))) return text;

  const quotes = new Set<string>();
  const combinedText = [feedback, ...(warnings || [])].filter(Boolean).join(' ');
  const regex = /['"]([^'"]+)['"]/g;
  let match;
  while ((match = regex.exec(combinedText)) !== null) {
    if (match[1].length > 3) quotes.add(match[1]);
  }

  if (quotes.size === 0) return text;

  const sortedQuotes = Array.from(quotes).sort((a, b) => b.length - a.length);
  const quoteRegex = new RegExp(`(${sortedQuotes.map(quote => quote.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  const parts = text.split(quoteRegex);

  return parts.map((part, index) =>
    index % 2 === 1
      ? <mark key={index} className="bg-red-200 dark:bg-red-900/60 text-red-900 dark:text-red-100 px-1 rounded-sm">{part}</mark>
      : <span key={index}>{part}</span>
  );
}

export function ContentCard({ businessId, content }: { businessId: string, content: ContentItem }) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isRevising, setIsRevising] = useState(false)
  const [isDeletingRegen, setIsDeletingRegen] = useState(false)
  const [isScheduling, setIsScheduling] = useState(false)
  const [showLinterPreview, setShowLinterPreview] = useState(false)

  // Scheduling state
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [platform, setPlatform] = useState('Instagram')

  // Form states for editing
  const [hook, setHook] = useState(content.hook || '')
  const [body, setBody] = useState(content.body || '')
  const [cta, setCta] = useState(content.cta || '')
  const [hashtags, setHashtags] = useState(content.hashtags?.join(' ') || '')

  const handleReviseAI = async () => {
    setIsRevising(true)
    try {
      await reviseContentWithAI(businessId, content.id)
      toast.success('Naskah berhasil direvisi oleh AI!')
    } catch (err: unknown) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsRevising(false)
    }
  }

  const handleDeleteAndRegenerate = async () => {
    if (!confirm('Hapus konten ini? Ide akan dikembalikan ke antrian untuk di-generate ulang.')) return
    setIsDeletingRegen(true)
    try {
      await deleteContent(businessId, content.id)
      toast.success('Konten dihapus. Jika ini berasal dari Ide, ide tersebut telah kembali ke antrian.')
    } catch (err: unknown) {
      toast.error(getErrorMessage(err))
      setIsDeletingRegen(false)
    }
  }

  const handleSaveEdit = async () => {
    try {
      const htArray = hashtags.split(' ').map((h: string) => h.trim()).filter((h: string) => h.length > 0)
      await saveManualEdit(businessId, content.id, hook, body, cta, htArray)
      toast.success('Naskah berhasil diperbarui secara manual!')
      setIsEditing(false)
    } catch (err: unknown) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleSchedule = async () => {
    if (!scheduleDate) {
      toast.error("Pilih tanggal dan waktu jadwal!")
      return
    }
    setIsScheduling(true)
    try {
      const isoDate = new Date(scheduleDate).toISOString()
      await scheduleContent(businessId, content.id, isoDate, platform)
      toast.success("Konten berhasil dijadwalkan!")
      setShowScheduleForm(false)
    } catch (err: unknown) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsScheduling(false)
    }
  }

  const aiScore = content.ai_score
  const needsRevision = aiScore !== null && aiScore !== undefined

  const fullCaptionText = [
    content.hook,
    content.body,
    content.cta,
    content.hashtags?.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' '),
  ]
    .filter(Boolean)
    .join('\n\n')
  const captionLint = fullCaptionText
    ? lintCaption(fullCaptionText, { truncateAt: 125, job: 'B', maxHashtags: 5 })
    : null

  return (
    <div className="border p-5 rounded-xl bg-card shadow-sm space-y-4">
      <div className="flex justify-between items-start gap-4">
        <h3 className="font-bold text-lg leading-tight">{content.title}</h3>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          content.status === 'draft' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
          content.status === 'generated' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
          content.status === 'needs_improvement' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
          content.status === 'approved_recommended' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' :
          'bg-primary/10 text-primary'
        }`}>
          {content.status.toUpperCase().replace('_', ' ')}
        </span>
      </div>

      <div className={`space-y-3 text-sm bg-muted/30 p-4 rounded-lg ${isEditing ? 'grid lg:grid-cols-2 gap-6' : ''}`}>
        
        {/* KOLOM KIRI: Kritik & Teks Asli (Hanya Muncul Saat Edit) */}
        {isEditing && (
          <div className="space-y-4 border-r pr-4">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h4 className="font-bold text-base">Referensi Kritik & Naskah Asli</h4>
            </div>
            
            {aiScore !== null && aiScore !== undefined && (
              <div className={`p-3 rounded-lg text-xs border ${aiScore >= 85 ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300' : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:text-red-300'}`}>
                <strong>Saran Perbaikan ({aiScore}/100):</strong>
                <p className="mt-1 opacity-90">{content.ai_feedback}</p>
              </div>
            )}
            
            {needsRevision && content.ai_claim_warnings && content.ai_claim_warnings.length > 0 && (
              <div className="bg-amber-100/50 border border-amber-200 p-3 rounded-lg text-xs text-amber-800">
                <strong className="block mb-1">⚠️ Peringatan Klaim (Overclaim):</strong>
                <ul className="list-disc pl-4 space-y-1">
                  {content.ai_claim_warnings.map((warn: string, i: number) => <li key={i}>{warn}</li>)}
                </ul>
              </div>
            )}

            <div className="space-y-3 bg-background/50 p-3 rounded-md border mt-2">
              {content.hook && (
                <div>
                  <span className="font-semibold text-primary block mb-1">Hook Asli:</span>
                  <span className="opacity-80 leading-relaxed block">{highlightProblematicText(content.hook, content.ai_feedback, content.ai_claim_warnings)}</span>
                </div>
              )}
              {content.body && (
                <div>
                  <span className="font-semibold text-primary block mb-1">Body Asli:</span>
                  <span className="opacity-80 whitespace-pre-wrap block">{highlightProblematicText(content.body, content.ai_feedback, content.ai_claim_warnings)}</span>
                </div>
              )}
              {content.cta && (
                <div>
                  <span className="font-semibold text-primary block mb-1">CTA Asli:</span>
                  <span className="opacity-80 block">{highlightProblematicText(content.cta, content.ai_feedback, content.ai_claim_warnings)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* KOLOM KANAN / FULL: Area Teks & Form Edit */}
        {isEditing ? (
          <div className="space-y-4 flex flex-col h-full">
            <h4 className="font-bold text-base border-b pb-2">Perbaiki Naskah Di Sini</h4>
            <div className="flex-1 space-y-4">
              <div>
                <label className="font-semibold text-primary block mb-1">Hook:</label>
                <textarea className="w-full p-2 border rounded-md min-h-[80px]" value={hook} onChange={e => setHook(e.target.value)} />
              </div>
              <div>
                <label className="font-semibold text-primary block mb-1">Body:</label>
                <textarea className="w-full p-2 border rounded-md min-h-[200px]" value={body} onChange={e => setBody(e.target.value)} />
              </div>
              <div>
                <label className="font-semibold text-primary block mb-1">Call to Action:</label>
                <textarea className="w-full p-2 border rounded-md min-h-[80px]" value={cta} onChange={e => setCta(e.target.value)} />
              </div>
              <div>
                <label className="font-semibold text-primary block mb-1">Hashtags (pisahkan dengan spasi):</label>
                <input type="text" className="w-full p-2 border rounded-md" value={hashtags} onChange={e => setHashtags(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-4 mt-auto">
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                <X className="w-4 h-4 mr-2" /> Batal
              </Button>
              <Button size="sm" onClick={handleSaveEdit}>
                <Save className="w-4 h-4 mr-2" /> Simpan Perubahan
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {content.hook && (
              <div><span className="font-semibold text-primary block mb-1">Hook:</span> <span className="font-medium text-lg leading-relaxed">{content.hook}</span></div>
            )}
            {content.body && (
              <div className="whitespace-pre-wrap"><span className="font-semibold text-primary block mb-1 mt-2">Body:</span><span className="text-muted-foreground">{content.body}</span></div>
            )}
            {content.cta && (
              <div><span className="font-semibold text-primary block mb-1 mt-2">Call to Action:</span> <span className="font-medium">{content.cta}</span></div>
            )}
            {content.hashtags && content.hashtags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {content.hashtags.map((ht: string, i: number) => (
                  <span key={i} className="text-xs text-blue-500 font-medium bg-blue-500/10 px-2 py-0.5 rounded-full">
                    {ht.startsWith('#') ? ht : `#${ht}`}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hasil Evaluasi AI & Aksi */}
      {aiScore !== null && aiScore !== undefined && (
        <div className={`p-4 rounded-lg border ${
          aiScore >= 75
            ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30'
            : 'bg-red-50 border-red-200 dark:bg-red-950/30'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            {aiScore >= 75
              ? <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              : <AlertTriangle className="w-5 h-5 text-red-600" />
            }
            <div className={`text-2xl font-black ${aiScore >= 75 ? 'text-emerald-600' : 'text-red-600'}`}>
              {aiScore}/100
            </div>
            <div className="font-semibold">
              {aiScore >= 75 ? '👍 Disetujui' : '⚠️ Perlu Perbaikan'}
            </div>
          </div>

          {content.ai_feedback && (
            <p className="text-sm text-muted-foreground mt-1">{content.ai_feedback}</p>
          )}

          {content.ai_claim_warnings && content.ai_claim_warnings.length > 0 && (
            <div className="mt-3 bg-amber-100/50 border border-amber-200 p-2 rounded text-xs text-amber-800">
              <strong className="block mb-1">⚠️ Peringatan Klaim:</strong>
              <ul className="list-disc pl-4 space-y-1">
                {content.ai_claim_warnings.map((warn: string, i: number) => <li key={i}>{warn}</li>)}
              </ul>
            </div>
          )}

          {captionLint && (
            <div className="mt-3 border-t border-border/50 pt-3">
              <button
                type="button"
                onClick={() => setShowLinterPreview(!showLinterPreview)}
                className="flex items-center justify-between w-full text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  Preview Feed IG (125 kar.) &amp; Linter
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full font-semibold ${
                    captionLint.verdict === 'READY'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : captionLint.verdict === 'REVIEW'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        : 'bg-red-500/15 text-red-600 dark:text-red-400'
                  }`}
                >
                  {captionLint.verdict} · {captionLint.characters} kar. · {captionLint.hashtags.length} tag
                </span>
              </button>

              {showLinterPreview && (
                <div className="mt-2 space-y-2 text-xs">
                  <div className="rounded-md bg-background/80 border p-2.5">
                    <div className="text-[11px] font-semibold text-muted-foreground mb-1">
                      Terlihat sebelum &ldquo;... more&rdquo; ({Math.min(captionLint.characters, 125)}/125):
                    </div>
                    <p className="whitespace-pre-wrap text-foreground">
                      {captionLint.visible}
                      {captionLint.truncated && <span className="text-muted-foreground"> ... more</span>}
                    </p>
                  </div>
                  <div className="space-y-1">
                    {captionLint.checks
                      .filter((c) => c.status !== 'PASS')
                      .map((c, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-[11px]">
                          <span
                            className={`font-bold shrink-0 ${
                              c.status === 'FAIL' ? 'text-red-600' : 'text-amber-600'
                            }`}
                          >
                            [{c.status}]
                          </span>
                          <span className="text-muted-foreground">
                            <strong>{c.check}:</strong> {c.detail}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dua pilihan keputusan untuk needs_improvement */}
          {!isEditing && content.status === 'needs_improvement' && (
            <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row gap-2">
              <Button
                variant="default"
                size="sm"
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                onClick={handleReviseAI}
                disabled={isRevising || isDeletingRegen}
              >
                {isRevising ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                Perbaiki dengan AI ✨
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
                onClick={handleDeleteAndRegenerate}
                disabled={isRevising || isDeletingRegen}
              >
                {isDeletingRegen ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Hapus & Generate Ulang
              </Button>
            </div>
          )}

          {/* Aksi untuk approved_recommended: Jadwalkan & Edit */}
          {!isEditing && content.status === 'approved_recommended' && (
            <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row gap-2 justify-between items-center">
              
              <div className="flex-1 w-full flex justify-end gap-2">
                <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setIsEditing(true)}>
                  <Edit3 className="w-4 h-4 mr-2" /> Edit Naskah
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary/40 text-primary hover:bg-primary/10"
                  onClick={() => router.push(`/dashboard/${businessId}/video?contentId=${content.id}`)}
                >
                  <Video className="w-4 h-4 mr-2" /> Buat Video
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white" 
                  onClick={() => setShowScheduleForm(!showScheduleForm)}
                >
                  <Calendar className="w-4 h-4 mr-2" /> Jadwalkan
                </Button>
              </div>
            </div>
          )}
          
          {/* Form Jadwalkan Inline */}
          {showScheduleForm && content.status === 'approved_recommended' && (
            <div className="mt-4 p-4 border rounded-lg bg-background flex flex-col gap-4">
              <h4 className="font-bold text-sm">📅 Atur Jadwal Publikasi</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold mb-1 block">Waktu Posting</label>
                  <input 
                    type="datetime-local" 
                    className="w-full text-sm p-2 border rounded bg-background" 
                    value={scheduleDate}
                    onChange={e => setScheduleDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block">Platform</label>
                  <select 
                    className="w-full text-sm p-2 border rounded bg-background"
                    value={platform}
                    onChange={e => setPlatform(e.target.value)}
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="Tiktok">Tiktok</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Twitter">Twitter/X</option>
                    <option value="Facebook">Facebook</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowScheduleForm(false)}>Batal</Button>
                <Button size="sm" onClick={handleSchedule} disabled={isScheduling}>
                  {isScheduling ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Konfirmasi'}
                </Button>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}


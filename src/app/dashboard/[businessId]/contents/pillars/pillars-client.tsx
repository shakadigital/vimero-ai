'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createPillar, createIdea, autoProcessIdea, deleteContentIdea, deleteAllPendingIdeas } from '@/lib/actions/content'
import { toast } from 'sonner'
import {
  Lightbulb, Inbox, Plus, X, ChevronDown,
  Hash, TrendingUp, Heart, BookOpen, ShoppingBag, Smile,
  Sparkles, Star, MessageSquare, Zap, Award, Target, Trash2
} from 'lucide-react'
import { getErrorMessage } from '@/lib/utils'

const IDEA_BANK_CATEGORIES = [
  { label: 'Fashion', cat: 'Ide Konten Fashion', icon: Star, color: 'from-pink-500/20 to-rose-500/10 border-pink-500/30 text-pink-400' },
  { label: 'Skincare', cat: 'Ide Konten Skincare', icon: Sparkles, color: 'from-purple-500/20 to-violet-500/10 border-purple-500/30 text-purple-400' },
  { label: 'Pengembangan Diri', cat: 'Ide Konten Pengembangan Diri', icon: TrendingUp, color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-400' },
  { label: 'Kesehatan', cat: 'Ide Konten Kesehatan', icon: Heart, color: 'from-green-500/20 to-emerald-500/10 border-green-500/30 text-green-400' },
  { label: 'Kecantikan', cat: 'Idea Kecantikan', icon: Award, color: 'from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-400' },
  { label: 'Finansial', cat: 'Idea Finansial', icon: Target, color: 'from-teal-500/20 to-cyan-500/10 border-teal-500/30 text-teal-400' },
  { label: 'Hook Konten', cat: 'Hook Konten', icon: Zap, color: 'from-orange-500/20 to-amber-500/10 border-orange-500/30 text-orange-400' },
  { label: 'List Hashtag', cat: 'List Hashtag', icon: Hash, color: 'from-indigo-500/20 to-blue-500/10 border-indigo-500/30 text-indigo-400' },
  { label: 'Quote Bijak', cat: '101 QUOTE KATA BIJAK', icon: BookOpen, color: 'from-violet-500/20 to-purple-500/10 border-violet-500/30 text-violet-400' },
  { label: 'Quote Percintaan', cat: '101 QUOTE PERCINTAAN', icon: Heart, color: 'from-rose-500/20 to-pink-500/10 border-rose-500/30 text-rose-400' },
  { label: 'Quote Komedi', cat: '101 QUOTE KOMEDI', icon: Smile, color: 'from-yellow-500/20 to-amber-500/10 border-yellow-500/30 text-yellow-400' },
  { label: 'Soft Selling', cat: '101 Ide Konten Soft Selling', icon: MessageSquare, color: 'from-sky-500/20 to-blue-500/10 border-sky-500/30 text-sky-400' },
  { label: 'Hard Selling', cat: '40+ Ide Konten Hard Selling', icon: ShoppingBag, color: 'from-red-500/20 to-rose-500/10 border-red-500/30 text-red-400' },
  { label: 'List Konten Galau', cat: '101 List Konten Galau', icon: BookOpen, color: 'from-slate-500/20 to-zinc-500/10 border-slate-500/30 text-slate-400' },
]

const PAGE_SIZE = 20

interface ContentIdeaItem {
  id: string
  title: string
  description?: string | null
  status: string
  pillarName?: string
}

interface ContentPillarItem {
  id: string
  name: string
  description?: string | null
  content_ideas?: ContentIdeaItem[] | null
}

interface PillarsClientProps {
  businessId: string
  pillars: ContentPillarItem[]
  pendingIdeas: ContentIdeaItem[]
}

export function PillarsClient({ businessId, pillars, pendingIdeas }: PillarsClientProps) {
  const router = useRouter()
  const [showPillarForm, setShowPillarForm] = useState(false)
  const [isCreatingPillar, setIsCreatingPillar] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [addingIdeaId, setAddingIdeaId] = useState<string | null>(null)
  const [deletingIdeaId, setDeletingIdeaId] = useState<string | null>(null)
  const [isClearingAll, setIsClearingAll] = useState(false)

  const visibleIdeas = pendingIdeas.slice(0, visibleCount)
  const hasMore = visibleCount < pendingIdeas.length

  const handleCreatePillar = async (formData: FormData) => {
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    if (!name?.trim()) return
    setIsCreatingPillar(true)
    try {
      await createPillar(businessId, name, description)
      toast.success('Pilar konten berhasil dibuat!')
      setShowPillarForm(false)
    } catch (e: unknown) {
      toast.error(getErrorMessage(e))
    } finally {
      setIsCreatingPillar(false)
    }
  }

  const handleConvertToDraft = async (ideaId: string, title: string, description: string) => {
    setAddingIdeaId(ideaId)
    try {
      const result = await autoProcessIdea(businessId, ideaId, title, description || '')
      if (result.status === 'approved_recommended') {
        toast.success(`✅ Konten selesai! Skor ${result.score}/100 — Disetujui. Lihat di Studio Konten.`, { duration: 4000 })
      } else {
        toast.warning(`⚠️ Konten dibuat, skor ${result.score}/100 — Perlu perbaikan. Cek di Studio Konten.`, { duration: 4000 })
      }
      setTimeout(() => router.push(`/dashboard/${businessId}/contents`), 1500)
    } catch (e: unknown) {
      toast.error(getErrorMessage(e))
      setAddingIdeaId(null)
    }
  }

  const handleDeleteIdea = async (ideaId: string) => {
    setDeletingIdeaId(ideaId)
    try {
      await deleteContentIdea(businessId, ideaId)
      toast.success('Ide dihapus dari antrian.')
    } catch (e: unknown) {
      toast.error(getErrorMessage(e))
      setDeletingIdeaId(null)
    }
  }

  const handleClearAllPending = async () => {
    if (!confirm(`Hapus semua ${pendingIdeas.length} ide dari antrian? Tindakan ini tidak dapat dibatalkan.`)) return
    setIsClearingAll(true)
    try {
      await deleteAllPendingIdeas(businessId)
      toast.success('Semua ide pending berhasil dihapus.')
    } catch (e: unknown) {
      toast.error(getErrorMessage(e))
      setIsClearingAll(false)
    }
  }

  return (
    <div className="space-y-8">

      {/* ── HEADER: Kategori Bank Ide + Tombol Buat Pilar ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Jelajahi Bank Ide (6.000+)
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Pilih kategori untuk eksplorasi template ide siap pakai</p>
          </div>
          <Button
            size="sm"
            variant={showPillarForm ? 'secondary' : 'outline'}
            onClick={() => setShowPillarForm(v => !v)}
            className="gap-2 shrink-0"
          >
            {showPillarForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            Buat Pilar Baru
          </Button>
        </div>

        {/* Form Buat Pilar (toggle) */}
        {showPillarForm && (
          <div className="mb-4 border border-primary/20 bg-primary/5 rounded-xl p-5 animate-in slide-in-from-top-2 duration-200">
            <h3 className="text-sm font-semibold mb-3 text-primary">Pilar Konten Baru</h3>
            <form action={handleCreatePillar} className="flex flex-col sm:flex-row gap-3">
              <input
                name="name"
                placeholder="Nama Pilar (contoh: Edukasi, Testimoni, Promosi)"
                className="flex h-9 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                required
                autoFocus
              />
              <input
                name="description"
                placeholder="Deskripsi singkat (opsional)"
                className="flex h-9 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={isCreatingPillar} className="shrink-0">
                  {isCreatingPillar ? 'Menyimpan...' : 'Simpan Pilar'}
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setShowPillarForm(false)} className="shrink-0">
                  Batal
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Grid Kategori Bank Ide */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
          <Link
            href={`/dashboard/${businessId}/contents/idea-bank`}
            className="col-span-1 flex flex-col items-center justify-center gap-1 p-3 rounded-xl border bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border-primary/30 hover:border-primary/60 transition-all group text-center"
          >
            <Sparkles className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-primary">Semua Ide</span>
          </Link>
          {IDEA_BANK_CATEGORIES.map(({ label, cat, icon: Icon, color }) => (
            <Link
              key={cat}
              href={`/dashboard/${businessId}/contents/idea-bank?category=${encodeURIComponent(cat)}`}
              className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl border bg-gradient-to-br ${color} hover:scale-[1.03] transition-all group text-center`}
            >
              <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── IDE DARI RISET ── */}
      {pendingIdeas.length > 0 && (
        <div>
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              <h2 className="text-base font-semibold">Ide Dari Riset</h2>
              <Badge variant="secondary" className="bg-yellow-400/10 text-yellow-400 border-yellow-400/20 text-xs">
                {pendingIdeas.length} menunggu
              </Badge>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClearAllPending}
              disabled={isClearingAll}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {isClearingAll ? 'Menghapus...' : 'Hapus Semua Antrian'}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {visibleIdeas.map((idea) => (
              <div
                key={idea.id}
                className="border border-yellow-400/20 bg-yellow-400/5 rounded-xl p-4 flex flex-col gap-3 hover:border-yellow-400/40 transition-colors relative group"
              >
                {/* Tombol hapus per card */}
                <button
                  onClick={() => handleDeleteIdea(idea.id)}
                  disabled={deletingIdeaId === idea.id}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                  title="Hapus dari antrian"
                >
                  {deletingIdeaId === idea.id
                    ? <span className="block animate-spin w-3 h-3 border border-current border-t-transparent rounded-full" />
                    : <X className="w-3.5 h-3.5" />
                  }
                </button>

                <div className="flex items-start justify-between gap-2 pr-6">
                  <span className="text-xs text-yellow-400/70 font-medium truncate">{idea.pillarName}</span>
                  <Badge variant="outline" className="text-xs border-yellow-400/30 text-yellow-400/70 shrink-0">Pending</Badge>
                </div>
                <h3 className="font-semibold text-sm leading-snug line-clamp-2 flex-1">{idea.title}</h3>
                {idea.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{idea.description}</p>
                )}
                <Button
                  size="sm"
                  className="w-full gap-2 mt-auto"
                  onClick={() => handleConvertToDraft(idea.id, idea.title, idea.description || '')}
                  disabled={addingIdeaId === idea.id || deletingIdeaId === idea.id}
                >
                  {addingIdeaId === idea.id ? (
                    <>
                      <span className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full" />
                      AI sedang menulis...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      Auto Generate & Review
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="mt-4 text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                className="gap-2"
              >
                <ChevronDown className="w-4 h-4" />
                Tampilkan {Math.min(PAGE_SIZE, pendingIdeas.length - visibleCount)} ide lagi
                <span className="text-muted-foreground">({pendingIdeas.length - visibleCount} tersisa)</span>
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── PILAR & IDE DI DALAMNYA ── */}
      {pillars.length > 0 && (
        <div>
          <h2 className="text-base font-semibold mb-4">Pilar Konten Anda</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {pillars.map((pillar) => {
              const ideas = (pillar.content_ideas || []).filter((i) => i.status !== 'converted')
              return (
                <div key={pillar.id} className="border rounded-xl bg-card shadow-sm flex flex-col overflow-hidden">
                  <div className="p-5 border-b">
                    <h3 className="font-bold text-base">{pillar.name}</h3>
                    {pillar.description && (
                      <p className="text-sm text-muted-foreground mt-1">{pillar.description}</p>
                    )}
                  </div>

                  {ideas.length > 0 ? (
                    <ul className="divide-y max-h-48 overflow-y-auto">
                      {ideas.map((idea) => (
                        <li key={idea.id} className="px-5 py-3 flex items-center justify-between gap-3">
                          <span className="text-sm flex-1 line-clamp-1">{idea.title}</span>
                          <Badge
                            variant="outline"
                            className="text-xs shrink-0 border-yellow-400/30 text-yellow-400"
                          >
                            Pending
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 py-6 text-muted-foreground">
                      <Inbox className="w-7 h-7 opacity-25" />
                      <p className="text-xs">Belum ada ide di pilar ini</p>
                    </div>
                  )}

                  {/* Form tambah ide manual */}
                  <div className="p-4 border-t bg-muted/20">
                    <AddIdeaForm businessId={businessId} pillarId={pillar.id} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {pillars.length === 0 && pendingIdeas.length === 0 && (
        <div className="text-center py-16 border border-dashed rounded-xl text-muted-foreground">
          <Lightbulb className="w-10 h-10 mx-auto mb-3 opacity-25" />
          <p className="font-medium">Belum ada pilar atau ide</p>
          <p className="text-sm mt-1">Klik &ldquo;Buat Pilar Baru&rdquo; di atas atau eksplorasi Bank Ide untuk mulai</p>
        </div>
      )}
    </div>
  )
}

function AddIdeaForm({ businessId, pillarId }: { businessId: string; pillarId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (formData: FormData) => {
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    if (!title?.trim()) return
    setLoading(true)
    try {
      await createIdea(businessId, pillarId, title, description)
      toast.success('Ide berhasil disimpan!')
      formRef.current?.reset()
      setOpen(false)
    } catch (e: unknown) {
      toast.error(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Tambah ide manual
      </button>
    )
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-2">
      <input
        name="title"
        placeholder="Judul ide..."
        className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        required
        autoFocus
      />
      <textarea
        name="description"
        placeholder="Deskripsi (opsional)..."
        className="flex min-h-[44px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" variant="secondary" disabled={loading} className="flex-1">
          {loading ? 'Menyimpan...' : 'Simpan'}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Batal
        </Button>
      </div>
    </form>
  )
}

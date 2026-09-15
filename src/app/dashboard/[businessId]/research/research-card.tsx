'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { generateContentFromResearch, deleteResearchItem } from '@/lib/actions/research'
import { createIdea } from '@/lib/actions/content'
import { toast } from 'sonner'
import { Loader2, Sparkles, Trash2, Lightbulb } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ResearchCardProps {
  item: {
    id: string
    business_id: string
    type: string
    title: string
    content: string
    created_at: string
  }
  pillars: { id: string; name: string }[]
}

export function ResearchCard({ item, pillars }: ResearchCardProps) {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [progress, setProgress] = useState<string | null>(null)
  const [selectedPillarId, setSelectedPillarId] = useState(pillars[0]?.id || '')
  const [isSavingIdea, setIsSavingIdea] = useState(false)

  async function handleSaveAsIdea() {
    if (!selectedPillarId) {
      toast.error('Buat Pilar Konten terlebih dahulu.')
      return
    }

    setIsSavingIdea(true)
    try {
      await createIdea(item.business_id, selectedPillarId, item.title, item.content)
      toast.success('Hasil riset disimpan sebagai ide pending di Pilar.')
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan hasil riset sebagai ide.')
    } finally {
      setIsSavingIdea(false)
    }
  }

  async function handleGenerate() {
    setIsGenerating(true)
    setProgress('Variasi 1/3: Edukatif...')

    // Simulate progress (actual work happens server-side)
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev?.includes('1/3')) return 'Variasi 2/3: Storytelling...'
        if (prev?.includes('2/3')) return 'Variasi 3/3: Soft-Selling...'
        return prev
      })
    }, 8000)

    try {
      const result = await generateContentFromResearch(
        item.business_id,
        item.title,
        item.content
      )

      clearInterval(progressTimer)

      const approved = result.results.filter(r => r.status === 'approved_recommended').length
      const needsFix = result.results.filter(r => r.status === 'needs_improvement').length

      if (approved > 0) {
        toast.success(
          `✅ ${approved} konten siap dijadwalkan${needsFix > 0 ? `, ${needsFix} perlu perbaikan` : ''}. Lihat di Studio Konten.`,
          { duration: 5000 }
        )
      } else {
        toast.warning(
          `⚠️ ${needsFix} konten dibuat, semua perlu perbaikan. Cek di Studio Konten.`,
          { duration: 5000 }
        )
      }

      setTimeout(() => router.push(`/dashboard/${item.business_id}/contents`), 1000)
    } catch (error: unknown) {
      clearInterval(progressTimer)
      toast.error(error instanceof Error ? error.message : 'Gagal membuat konten dari riset.')
      setIsGenerating(false)
      setProgress(null)
    }
  }

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await deleteResearchItem(item.business_id, item.id)
      toast.success('Laporan riset dihapus.')
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus laporan riset.')
      setIsDeleting(false)
    }
  }

  return (
    <Card className={`flex flex-col transition-opacity ${isGenerating ? 'opacity-75' : ''}`}>
      <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-tight">{item.title}</CardTitle>
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0 capitalize">
            {item.type}
          </span>
        </div>
        <CardDescription>
          {new Date(item.created_at).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow p-4 pt-0 sm:p-6 sm:pt-0">
        <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">{item.content}</p>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 border-t p-4 pt-3 sm:p-6 sm:pt-4">
        {pillars.length > 0 ? (
          <div className="flex w-full gap-2">
            <Select value={selectedPillarId} onValueChange={(value) => value && setSelectedPillarId(value)}>
              <SelectTrigger size="sm" className="min-w-0 flex-1">
                <SelectValue placeholder="Pilih Pilar" />
              </SelectTrigger>
              <SelectContent>
                {pillars.map((pillar) => <SelectItem key={pillar.id} value={pillar.id}>{pillar.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={handleSaveAsIdea} disabled={isSavingIdea || isGenerating || isDeleting} className="gap-2">
              {isSavingIdea ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4" />}
              Simpan Ide
            </Button>
          </div>
        ) : (
          <p className="w-full text-xs text-muted-foreground">Buat Pilar terlebih dahulu untuk menyimpan hasil riset sebagai ide.</p>
        )}

        <div className="flex w-full gap-2">
          <Button
            size="sm"
            onClick={handleGenerate}
            disabled={isGenerating || isDeleting || isSavingIdea}
            className="flex-1 gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700"
          >
            {isGenerating ? <><Loader2 className="h-4 w-4 animate-spin" /><span className="truncate">{progress ?? 'AI sedang menulis...'}</span></> : <><Sparkles className="h-4 w-4" />Buat Konten (3 Variasi)</>}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDelete} disabled={isGenerating || isDeleting || isSavingIdea} className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive">
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

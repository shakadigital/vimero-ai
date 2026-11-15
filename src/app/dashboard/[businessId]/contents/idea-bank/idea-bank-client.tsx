'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useIdeaFromBank as applyIdeaFromBank, autoGenerateFromIdeaBank } from '@/lib/actions/content'
import { toast } from 'sonner'
import { PlusCircle, Loader2, Sparkles } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getErrorMessage } from '@/lib/utils'

interface IdeaItem {
  id: string
  category: string
  title: string
  description?: string | null
}

interface PillarItem {
  id: string
  name: string
}

interface IdeaBankClientProps {
  businessId: string
  initialIdeas: IdeaItem[]
  categories: string[]
  pillars: PillarItem[]
}

export function IdeaBankClient({ businessId, initialIdeas, categories, pillars }: IdeaBankClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get('category') || 'all'
  const [isAdding, setIsAdding] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState<string | null>(null)
  
  // initialIdeas is now already filtered by the server
  const filteredIdeas = initialIdeas

  const handleUseIdea = async (ideaId: string, ideaTitle: string, ideaDesc: string) => {
    if (pillars.length === 0) {
      toast.error("Anda belum memiliki Pilar Konten. Silakan buat pilar terlebih dahulu.")
      return
    }

    // Default ke pilar pertama (ideal: beri popup pilih pilar, tapi untuk kecepatan pakai pilar 1)
    const defaultPillarId = pillars[0].id

    setIsAdding(ideaId)
    try {
      const res = await applyIdeaFromBank(businessId, defaultPillarId, ideaTitle, ideaDesc || ideaTitle)
      if (res.success) {
        toast.success(`Ide berhasil ditambahkan ke pilar ${pillars[0].name}!`)
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Gagal menyalin ide."))
    } finally {
      setIsAdding(null)
    }
  }

  const handleAutoGenerate = async (ideaId: string, ideaTitle: string, ideaDesc: string) => {
    if (pillars.length === 0) {
      toast.error('Buat minimal 1 Pilar Konten dulu sebelum melakukan auto-generate!')
      return
    }
    
    setIsGenerating(ideaId)
    try {
      // Untuk demo, kita pakai pilar pertama
      const pillarId = pillars[0].id
      await autoGenerateFromIdeaBank(businessId, pillarId, ideaTitle, ideaDesc)
      toast.success('🎉 Naskah berhasil digenerate otomatis!')
      router.push(`/dashboard/${businessId}/contents`)
    } catch (err: unknown) {
      toast.error('Gagal generate naskah: ' + getErrorMessage(err))
    } finally {
      setIsGenerating(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-card p-4 rounded-xl border shadow-sm">
        <div className="space-y-1">
          <p className="text-sm font-medium">Filter Kategori Niche</p>
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant={activeCategory === 'all' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => router.push(`/dashboard/${businessId}/contents/idea-bank`)}
            >
              Semua (Random Mix)
            </Badge>
            {categories.map((cat: string) => (
              <Badge 
                key={cat}
                variant={activeCategory === cat ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => router.push(`/dashboard/${businessId}/contents/idea-bank?category=${encodeURIComponent(cat)}`)}
              >
                {cat.replace('Ide Konten ', '').replace('101 ', '').replace('Idea ', '')}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredIdeas.map((idea) => (
          <Card key={idea.id} className="flex flex-col hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <Badge variant="secondary" className="w-fit mb-2 text-xs">
                {idea.category.replace('Ide Konten ', '')}
              </Badge>
              <CardTitle className="text-lg leading-tight line-clamp-3">{idea.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-3">
              <p className="text-sm text-muted-foreground line-clamp-4">
                {idea.description || "Gunakan kalimat ini sebagai hook atau ide utama untuk video Anda."}
              </p>
            </CardContent>
            <CardFooter className="pt-0">
              <div className="flex gap-2 w-full mt-auto pt-4">
                <Button 
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleUseIdea(idea.id, idea.title, idea.description || '')}
                  disabled={isAdding === idea.id || isGenerating === idea.id}
                >
                  {isAdding === idea.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PlusCircle className="w-4 h-4 mr-2" />}
                  Simpan Draft
                </Button>
                
                <Button 
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0"
                  onClick={() => handleAutoGenerate(idea.id, idea.title, idea.description || '')}
                  disabled={isAdding === idea.id || isGenerating === idea.id}
                >
                  {isGenerating === idea.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  Auto-AI 🤖
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}

        {filteredIdeas.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-xl">
            Belum ada ide di kategori ini atau data sedang dimuat dari Excel.
          </div>
        )}
      </div>
    </div>
  )
}

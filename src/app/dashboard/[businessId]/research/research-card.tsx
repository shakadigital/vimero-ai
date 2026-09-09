'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { convertToIdea, deleteResearchItem } from '@/lib/actions/research'
import { toast } from 'sonner'
import { Loader2, Lightbulb, Trash2 } from 'lucide-react'

interface ResearchCardProps {
  item: {
    id: string
    business_id: string
    type: string
    title: string
    content: string
    created_at: string
  }
}

export function ResearchCard({ item }: ResearchCardProps) {
  const [isConverting, setIsConverting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleConvert() {
    setIsConverting(true)
    try {
      await convertToIdea(item.business_id, item.title, item.content)
      toast.success("Hasil riset ditambahkan ke Bank Ide.")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsConverting(false)
    }
  }

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await deleteResearchItem(item.business_id, item.id)
      toast.success("Laporan riset telah dihapus.")
    } catch (error: any) {
      toast.error(error.message)
      setIsDeleting(false)
    }
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg leading-tight">{item.title}</CardTitle>
        <CardDescription>
          {new Date(item.created_at).toLocaleDateString('id-ID', { 
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow whitespace-pre-wrap text-sm text-muted-foreground">
        {item.content}
      </CardContent>
      <CardFooter className="flex gap-2 justify-between border-t pt-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleConvert}
          disabled={isConverting || isDeleting}
        >
          {isConverting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lightbulb className="w-4 h-4 mr-2" />}
          Jadikan Ide Konten
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleDelete}
          disabled={isConverting || isDeleting}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </Button>
      </CardFooter>
    </Card>
  )
}

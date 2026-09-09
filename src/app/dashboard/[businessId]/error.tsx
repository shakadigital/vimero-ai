'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-destructive">Terjadi Kesalahan!</h2>
        <p className="text-muted-foreground">Kami tidak dapat memuat data Command Center.</p>
      </div>
      <Button variant="outline" onClick={() => reset()}>
        Coba Lagi
      </Button>
    </div>
  )
}

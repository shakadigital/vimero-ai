'use client'

import { useActionState } from 'react'
import { createBusiness } from '@/lib/actions/business'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { SubmitButton } from '@/components/auth/submit-button'

export function OnboardingForm() {
  const [state, formAction] = useActionState(createBusiness, null)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buat Profil Bisnis Pertama Anda</CardTitle>
        <CardDescription>
          VIMERO membutuhkan konteks bisnis untuk membantu Anda dengan fitur AI.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state?.error && (
            <div className="text-sm font-medium text-destructive">
              {state.error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Nama Bisnis *</Label>
            <Input id="name" name="name" type="text" placeholder="Contoh: Kedai Kopi Senja" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry">Industri</Label>
            <Input id="industry" name="industry" type="text" placeholder="Contoh: Makanan & Minuman" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi Singkat</Label>
            <Input id="description" name="description" type="text" placeholder="Apa yang bisnis Anda tawarkan?" />
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton pendingText="Membuat Bisnis...">Lanjutkan ke Dasbor</SubmitButton>
        </CardFooter>
      </form>
    </Card>
  )
}

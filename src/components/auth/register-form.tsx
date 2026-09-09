'use client'

import { useActionState } from 'react'
import { register } from '@/lib/actions/auth'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { SubmitButton } from './submit-button'
import Link from 'next/link'

export function RegisterForm() {
  const [state, formAction] = useActionState(register, null)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar VIMERO</CardTitle>
        <CardDescription>
          Buat akun baru untuk mulai mengelola bisnis Anda.
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
            <Label htmlFor="full_name">Nama Lengkap</Label>
            <Input id="full_name" name="full_name" type="text" placeholder="John Doe" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="nama@email.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <SubmitButton pendingText="Memproses...">Mendaftar</SubmitButton>
          <div className="text-sm text-center text-muted-foreground">
            Sudah punya akun? <Link href="/auth/login" className="underline">Masuk di sini</Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}

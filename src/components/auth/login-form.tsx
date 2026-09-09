'use client'

import { useActionState } from 'react'
import { login } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { SubmitButton } from './submit-button'
import Link from 'next/link'

export function LoginForm() {
  const [state, formAction] = useActionState(login, null)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Masuk ke VIMERO</CardTitle>
        <CardDescription>
          Silakan masukkan kredensial Anda untuk melanjutkan ke Command Center.
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
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="nama@email.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <SubmitButton pendingText="Memproses...">Masuk</SubmitButton>
          <div className="text-sm text-center text-muted-foreground">
            Belum punya akun? <Link href="/auth/register" className="underline">Daftar sekarang</Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}

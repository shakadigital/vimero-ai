'use client'

import { useActionState } from 'react'
import { requestPasswordReset } from '@/lib/actions/auth'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { SubmitButton } from './submit-button'
import Link from 'next/link'

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(requestPasswordReset, null)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lupa Password</CardTitle>
        <CardDescription>
          Masukkan email akun VIMERO Anda untuk menerima tautan reset password.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state?.error && (
            <div className="text-sm font-medium text-destructive">
              {state.error}
            </div>
          )}
          {state?.success && state?.message && (
            <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              {state.message}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="nama@email.com" required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <SubmitButton pendingText="Mengirim...">Kirim Link Reset</SubmitButton>
          <div className="text-sm text-center text-muted-foreground">
            Ingat password Anda? <Link href="/auth/login" className="underline">Kembali ke Login</Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}

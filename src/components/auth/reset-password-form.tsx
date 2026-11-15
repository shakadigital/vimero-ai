'use client'

import { useActionState } from 'react'
import { updatePassword } from '@/lib/actions/auth'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { SubmitButton } from './submit-button'

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(updatePassword, null)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buat Password Baru</CardTitle>
        <CardDescription>
          Masukkan password baru untuk akun VIMERO Anda (minimal 6 karakter).
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
            <Label htmlFor="password">Password Baru</Label>
            <Input id="password" name="password" type="password" minLength={6} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm_password">Konfirmasi Password Baru</Label>
            <Input id="confirm_password" name="confirm_password" type="password" minLength={6} required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <SubmitButton pendingText="Menyimpan...">Simpan Password Baru</SubmitButton>
        </CardFooter>
      </form>
    </Card>
  )
}

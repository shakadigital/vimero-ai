import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ensurePersonalWorkspace } from '@/lib/actions/business'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const businessId = await ensurePersonalWorkspace()
  redirect(`/dashboard/${businessId}`)
}

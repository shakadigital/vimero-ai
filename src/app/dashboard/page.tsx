import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ensurePersonalWorkspace } from '@/lib/actions/business'

export default async function DashboardIndex() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const businessId = await ensurePersonalWorkspace()
  redirect(`/dashboard/${businessId}`)
}

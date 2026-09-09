'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

export async function createBusiness(prevState: any, formData: FormData) {
  // 1. Validasi user via client normal (dengan cookie sesi)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const name = formData.get('name') as string
  const industry = formData.get('industry') as string
  const description = formData.get('description') as string

  if (!name) {
    return { success: false, error: 'Business name is required' }
  }

  // 2. Gunakan admin client (service role) untuk bypass RLS
  const admin = createAdminClient()

  const { data: business, error } = await admin
    .from('businesses')
    .insert({ name, industry, description })
    .select('id')
    .single()

  if (error || !business) {
    return { success: false, error: error?.message || 'Failed to create business' }
  }

  // 3. Tambahkan user sebagai owner (trigger mungkin tidak aktif dengan service role)
  await admin
    .from('business_members')
    .insert({ business_id: business.id, user_id: user.id, role: 'owner' })

  redirect(`/dashboard/${business.id}`)
}

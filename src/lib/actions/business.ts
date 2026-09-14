'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

export async function ensurePersonalWorkspace() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: memberships, error: membershipError } = await supabase
    .from('business_members')
    .select('business_id')
    .eq('user_id', user.id)
    .limit(10)

  if (membershipError) {
    throw new Error(membershipError.message)
  }

  if (memberships && memberships.length > 0) {
    return memberships[0].business_id
  }

  const defaultName =
    typeof user.user_metadata?.full_name === 'string' && user.user_metadata.full_name.trim().length > 0
      ? `${user.user_metadata.full_name.trim()} Workspace`
      : 'Personal Workspace'

  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .insert({
      name: defaultName,
      industry: 'Personal',
      description: 'Workspace pribadi untuk pembuatan konten, audio, dan video AI.',
    })
    .select('id')
    .single()

  if (businessError || !business) {
    throw new Error(businessError?.message || 'Failed to create personal workspace')
  }

  const { error: memberError } = await supabase
    .from('business_members')
    .insert({ business_id: business.id, user_id: user.id, role: 'owner' })

  if (memberError) {
    await supabase.from('businesses').delete().eq('id', business.id)
    throw new Error(memberError.message)
  }

  return business.id
}

export async function createBusiness(_prevState: unknown, formData: FormData) {
  // 1. Validasi user via client normal (dengan cookie sesi)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const parsed = z.object({
    name: z.string().trim().min(1).max(120),
    industry: z.string().trim().max(120),
    description: z.string().trim().max(2_000),
  }).safeParse({
    name: formData.get('name'),
    industry: formData.get('industry') || '',
    description: formData.get('description') || '',
  })

  if (!parsed.success) return { success: false, error: 'Data bisnis tidak valid.' }
  const { name, industry, description } = parsed.data

  const { data: business, error } = await supabase
    .from('businesses')
    .insert({ name, industry, description })
    .select('id')
    .single()

  if (error || !business) {
    return { success: false, error: error?.message || 'Failed to create business' }
  }

  const { error: memberError } = await supabase
    .from('business_members')
    .insert({ business_id: business.id, user_id: user.id, role: 'owner' })
  if (memberError) {
    await supabase.from('businesses').delete().eq('id', business.id)
    return { success: false, error: 'Gagal membuat akses owner bisnis.' }
  }

  redirect(`/dashboard/${business.id}`)
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateBusinessProfile(formData: FormData) {
  const supabase = await createClient()
  
  const business_id = formData.get('business_id') as string
  const name = formData.get('name') as string
  const industry = formData.get('industry') as string
  const description = formData.get('description') as string

  if (!business_id || !name) throw new Error('Business ID and Name required')

  // Check RLS automatically handles permission, but we do an update
  const { error } = await supabase
    .from('businesses')
    .update({ name, industry, description })
    .eq('id', business_id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(`/dashboard/${business_id}/settings/profile`)
}

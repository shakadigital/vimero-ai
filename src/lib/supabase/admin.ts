import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Admin client yang menggunakan service_role key
// Hanya untuk operasi server-side terpercaya yang sudah memvalidasi user secara manual
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

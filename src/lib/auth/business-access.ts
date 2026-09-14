import 'server-only'
import { createClient } from '@/lib/supabase/server'

export class AuthorizationError extends Error {}

export const ALLOWED_PLATFORMS = new Set([
  'instagram',
  'tiktok',
  'facebook',
  'linkedin',
  'twitter',
  'x',
])

export function assertUuid(value: string, label: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value || '')) {
    throw new AuthorizationError(`${label} tidak valid.`)
  }
}

export function assertPlatform(platform: string) {
  if (!ALLOWED_PLATFORMS.has(String(platform || '').toLowerCase())) {
    throw new AuthorizationError('Platform tidak valid.')
  }
}

export function assertText(value: string, label: string, max = 20_000) {
  if (typeof value !== 'string' || value.length > max) {
    throw new AuthorizationError(`${label} tidak valid atau terlalu panjang.`)
  }
}

/**
 * Verifies the caller is an authenticated member of `businessId` and returns a
 * session-bound Supabase client so RLS stays enforced for subsequent queries.
 */
export async function requireBusinessMembership(
  businessId: string,
  allowedRoles?: Array<'owner' | 'admin' | 'member'>,
) {
  assertUuid(businessId, 'Business ID')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new AuthorizationError('Akses ditolak: pengguna belum login.')

  const { data: membership, error } = await supabase
    .from('business_members')
    .select('role')
    .eq('business_id', businessId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error || !membership) throw new AuthorizationError('Akses ditolak: Anda bukan anggota bisnis ini.')
  const role = membership.role as 'owner' | 'admin' | 'member'
  if (allowedRoles && !allowedRoles.includes(role)) {
    throw new AuthorizationError('Akses ditolak: role Anda tidak cukup.')
  }

  return { supabase, user, role }
}

/**
 * Confirms a row in `table` belongs to `businessId` using the RLS-scoped client.
 */
export async function assertResourceInBusiness(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: 'contents' | 'content_ideas' | 'content_pillars' | 'media_assets' | 'generation_history',
  resourceId: string,
  businessId: string,
) {
  assertUuid(resourceId, 'Resource ID')
  const { data, error } = await supabase
    .from(table)
    .select('id')
    .eq('id', resourceId)
    .eq('business_id', businessId)
    .maybeSingle()
  if (error || !data) throw new AuthorizationError('Data tidak ditemukan atau akses ditolak.')
}

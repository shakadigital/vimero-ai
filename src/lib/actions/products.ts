'use server'

import { revalidatePath } from 'next/cache'
import { assertText, requireBusinessMembership } from '@/lib/auth/business-access'

type OfferingType = 'product' | 'service'

function assertOfferingType(type: string): asserts type is OfferingType {
  if (type !== 'product' && type !== 'service') throw new Error('Jenis penawaran tidak valid.')
}

function revalidateProducts(businessId: string) {
  revalidatePath(`/dashboard/${businessId}/products`)
}

export async function createProduct(
  businessId: string,
  type: OfferingType,
  name: string,
  description: string,
  priceInfo: string,
  url: string
) {
  const { supabase } = await requireBusinessMembership(businessId)
  assertOfferingType(type)
  assertText(name, 'Nama', 200)
  if (description) assertText(description, 'Deskripsi', 4_000)
  if (priceInfo) assertText(priceInfo, 'Informasi harga', 200)
  if (url) assertText(url, 'URL', 500)

  const { error } = await supabase.from('products_services').insert({
    business_id: businessId,
    type,
    name: name.trim(),
    description: description.trim() || null,
    price_info: priceInfo.trim() || null,
    url: url.trim() || null
  })

  if (error) throw new Error(error.message)
  revalidateProducts(businessId)
  return { success: true }
}

export async function updateProduct(
  businessId: string,
  productId: string,
  type: OfferingType,
  name: string,
  description: string,
  priceInfo: string,
  url: string
) {
  const { supabase } = await requireBusinessMembership(businessId)
  const { data: existingProduct } = await supabase
    .from('products_services')
    .select('id')
    .eq('id', productId)
    .eq('business_id', businessId)
    .single()
  if (!existingProduct) throw new Error('Penawaran tidak ditemukan.')
  assertOfferingType(type)
  assertText(name, 'Nama', 200)
  if (description) assertText(description, 'Deskripsi', 4_000)
  if (priceInfo) assertText(priceInfo, 'Informasi harga', 200)
  if (url) assertText(url, 'URL', 500)

  const { error } = await supabase
    .from('products_services')
    .update({
      type,
      name: name.trim(),
      description: description.trim() || null,
      price_info: priceInfo.trim() || null,
      url: url.trim() || null
    })
    .eq('id', productId)
    .eq('business_id', businessId)

  if (error) throw new Error(error.message)
  revalidateProducts(businessId)
  return { success: true }
}

export async function deleteProduct(businessId: string, productId: string) {
  const { supabase } = await requireBusinessMembership(businessId)
  const { data: existingProduct } = await supabase
    .from('products_services')
    .select('id')
    .eq('id', productId)
    .eq('business_id', businessId)
    .single()
  if (!existingProduct) throw new Error('Penawaran tidak ditemukan.')

  const { error } = await supabase
    .from('products_services')
    .delete()
    .eq('id', productId)
    .eq('business_id', businessId)

  if (error) throw new Error(error.message)
  revalidateProducts(businessId)
  return { success: true }
}

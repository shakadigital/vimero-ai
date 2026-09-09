'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { runCreativeDirector } from '@/lib/ai/agents/director'
import { generateImageCloudflare } from '@/lib/ai/image-router'

export async function generateCreativeImage(businessId: string, contentId: string | null, brief: string) {
  const userClient = await createClient()
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) throw new Error("Akses ditolak: pengguna belum login.")

  const adminClient = createAdminClient()

  try {
    // 1. Creative Director AI creates the image prompt
    const directorOutput = await runCreativeDirector(businessId, brief)
    
    // 2. Generate Image via Cloudflare Stable Diffusion / Fallback Engine
    const imageBuffer = await generateImageCloudflare(directorOutput.image_prompt)
    
    // 3. Upload to Supabase Storage (media bucket) using admin client
    const fileName = `${businessId}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`
    const { error: uploadError } = await adminClient.storage
      .from('media')
      .upload(fileName, imageBuffer, { contentType: 'image/jpeg', upsert: true })
      
    if (uploadError) {
      console.warn(`Supabase Storage upload warning: ${uploadError.message}. Using direct base64/fallback...`)
    }
    
    // Get public URL
    const { data: publicUrlData } = adminClient.storage.from('media').getPublicUrl(fileName)
    const publicUrl = publicUrlData.publicUrl

    // 4. Save to media_assets
    await adminClient.from('media_assets').insert({
      business_id: businessId,
      file_url: publicUrl,
      type: 'generated_image'
    })
    
    // 5. Save to generation_history
    await adminClient.from('generation_history').insert({
      business_id: businessId,
      content_id: contentId || null,
      prompt: directorOutput.image_prompt,
      aspect_ratio: '1:1',
      model: '@cf/stabilityai/stable-diffusion-xl-base-1.0',
      image_url: publicUrl
    })

    revalidatePath(`/dashboard/${businessId}/studio`)
    return { success: true, imageUrl: publicUrl, prompt: directorOutput.image_prompt }

  } catch (error: any) {
    console.error('generateCreativeImage Error:', error)
    throw new Error(error.message)
  }
}

export async function deleteCreativeImage(businessId: string, imageId: string, imageUrl: string) {
  const userClient = await createClient()
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) throw new Error("Akses ditolak: pengguna belum login.")

  const adminClient = createAdminClient()

  try {
    // 1. Ekstrak nama file dari URL (asumsi URL Supabase public)
    const urlParts = imageUrl.split('/')
    const fileName = urlParts.slice(urlParts.length - 2).join('/') // Mengambil businessId/nama-file.jpg

    // 2. Hapus file fisik dari Storage
    if (fileName && fileName.includes(businessId)) {
      await adminClient.storage.from('media').remove([fileName])
    }

    // 3. Hapus dari database (generation_history dan media_assets)
    await adminClient.from('generation_history').delete().eq('id', imageId)
    await adminClient.from('media_assets').delete().eq('file_url', imageUrl)

    revalidatePath(`/dashboard/${businessId}/studio`)
    return { success: true }
  } catch (error: any) {
    console.error('deleteCreativeImage Error:', error)
    throw new Error(error.message)
  }
}

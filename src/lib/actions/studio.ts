'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { runCreativeDirector, runVideoDirector } from '@/lib/ai/agents/director'
import { generateImageCloudflare } from '@/lib/ai/image-router'
import { randomUUID } from 'node:crypto'
import { requireBusinessMembership, assertResourceInBusiness, assertText } from '@/lib/auth/business-access'

export async function generateCreativeImage(businessId: string, contentId: string | null, brief: string) {
  const { supabase } = await requireBusinessMembership(businessId)
  assertText(brief, 'Brief', 4_000)

  if (contentId) {
    await assertResourceInBusiness(supabase, 'contents', contentId, businessId)
  }

  const adminClient = createAdminClient()

  try {
    // 1. Creative Director AI creates the image prompt
    const directorOutput = await runCreativeDirector(businessId, brief)
    
    // 2. Generate Image via Cloudflare Stable Diffusion / Fallback Engine
    const imageBuffer = await generateImageCloudflare(directorOutput.image_prompt)
    
    // 3. Upload to Supabase Storage (media bucket) using admin client
    const fileName = `${businessId}/${Date.now()}-${randomUUID()}.jpg`
    const { error: uploadError } = await adminClient.storage
      .from('media')
      .upload(fileName, imageBuffer, { contentType: 'image/jpeg', upsert: true })
      
    if (uploadError) throw uploadError

    // Media bucket is private; issue a short-lived URL instead of exposing the object publicly.
    const { data: signedUrlData, error: signedUrlError } = await adminClient.storage
      .from('media')
      .createSignedUrl(fileName, 60 * 60)
    if (signedUrlError || !signedUrlData?.signedUrl) throw signedUrlError || new Error('Gagal membuat URL media')
    const mediaUrl = signedUrlData.signedUrl

    // 4. Save to media_assets
    const { error: assetError } = await adminClient.from('media_assets').insert({
      business_id: businessId,
      file_url: mediaUrl,
      type: 'generated_image'
    })
    
    if (assetError) throw assetError

    // 5. Save to generation_history
    const { error: historyError } = await adminClient.from('generation_history').insert({
      business_id: businessId,
      content_id: contentId || null,
      prompt: directorOutput.image_prompt,
      aspect_ratio: '1:1',
      model: '@cf/stabilityai/stable-diffusion-xl-base-1.0',
      image_url: mediaUrl
    })
    if (historyError) throw historyError

    revalidatePath(`/dashboard/${businessId}/studio`)
    return { success: true, imageUrl: mediaUrl, prompt: directorOutput.image_prompt }

  } catch (error: any) {
    console.error('generateCreativeImage Error:', error)
    throw new Error(error.message)
  }
}

export async function deleteCreativeImage(businessId: string, imageId: string, _imageUrl: string) {
  void _imageUrl
  const { supabase } = await requireBusinessMembership(businessId)
  const adminClient = createAdminClient()

  try {
    const { data: history, error: historyError } = await supabase
      .from('generation_history')
      .select('image_url')
      .eq('id', imageId)
      .eq('business_id', businessId)
      .single()
    if (historyError || !history) throw new Error('Asset tidak ditemukan atau akses ditolak.')

    const imageUrl = history.image_url || ''
    let fileName = ''
    try {
      const url = new URL(imageUrl)
      const marker = url.pathname.match(/\/storage\/v1\/object\/(?:public|sign)\/media\/(.+)$/)
      fileName = marker ? decodeURIComponent(marker[1]) : ''
    } catch {
      fileName = ''
    }

    if (fileName.startsWith(`${businessId}/`)) {
      const { error: storageError } = await adminClient.storage.from('media').remove([fileName])
      if (storageError) throw storageError
    }

    const { error: historyDeleteError } = await adminClient
      .from('generation_history')
      .delete()
      .eq('id', imageId)
      .eq('business_id', businessId)
    if (historyDeleteError) throw historyDeleteError

    const { error: assetDeleteError } = await adminClient
      .from('media_assets')
      .delete()
      .eq('file_url', imageUrl)
      .eq('business_id', businessId)
    if (assetDeleteError) throw assetDeleteError

    revalidatePath(`/dashboard/${businessId}/studio`)
    return { success: true }
  } catch (error: any) {
    console.error('deleteCreativeImage Error:', error)
    throw new Error('Asset gagal dihapus.')
  }
}

export async function generateStockVideo(businessId: string, contentId: string | null, brief: string) {
  const { supabase } = await requireBusinessMembership(businessId)
  assertText(brief, 'Brief', 4_000)

  if (contentId) {
    await assertResourceInBusiness(supabase, 'contents', contentId, businessId)
  }

  const adminClient = createAdminClient()

  try {
    // 1. Dapatkan keyword spesifik dari AI Director
    // NOTE: Harus import runVideoDirector di atas
    const directorOutput = await runVideoDirector(businessId, brief)
    const queries = directorOutput?.queries || ['business', 'working', 'success']

    let videoUrls: string[] = []
    
    // 2. Coba ambil dari Pexels API jika ada key
    const pexelsKey = process.env.PEXELS_API_KEY
    if (pexelsKey) {
      // Loop untuk setiap query dan ambil 1 video secara acak dari top 15 hasil
      for (const query of queries) {
        const res = await fetch(`https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=15&orientation=portrait`, {
          headers: { 'Authorization': pexelsKey }
        })
        if (res.ok) {
          const data = await res.json()
          if (data.videos && data.videos.length > 0) {
            // Pilih satu video secara acak dari hasil yang ada
            const randomIndex = Math.floor(Math.random() * data.videos.length)
            const v = data.videos[randomIndex]
            
            const hdFile = v.video_files.find((f: any) => f.quality === 'hd') || v.video_files[0]
            if (hdFile) videoUrls.push(hdFile.link)
          }
        }
      }
    }

    // 3. Fallback jika Pexels gagal / tidak ada key
    // Kita isi video acak sebanyak jumlah query yang diminta (atau minimal 3)
    if (videoUrls.length < queries.length) {
      console.warn("Pexels API key missing or failed to fetch enough videos, using fallback stock videos.")
      const fallbacks = [
        "https://cdn.pixabay.com/video/2020/03/19/33892-400196230_large.mp4",
        "https://cdn.pixabay.com/video/2019/11/04/28731-370591011_large.mp4",
        "https://cdn.pixabay.com/video/2023/10/22/185989-876722394_large.mp4",
        "https://cdn.pixabay.com/video/2021/08/17/85369-589574486_large.mp4",
        "https://cdn.pixabay.com/video/2022/02/10/107122-675850906_large.mp4",
        "https://cdn.pixabay.com/video/2023/10/24/186255-877402636_large.mp4"
      ]
      const targetCount = Math.max(3, queries.length)
      videoUrls = [...fallbacks].sort(() => 0.5 - Math.random()).slice(0, targetCount)
    }

    // 4. Hapus aset lama untuk konten ini (opsional tapi disarankan agar rapi)
    if (contentId) {
      const { error } = await adminClient.from('media_assets').delete().eq('business_id', businessId).eq('type', 'video')
      if (error) throw error
    }

    // 5. Simpan 3 video ke media_assets
    for (const url of videoUrls) {
      const { error } = await adminClient.from('media_assets').insert({
        business_id: businessId,
        file_url: url,
        type: 'video'
      })
      if (error) throw error
    }
    
    // 6. Simpan ke generation_history (satu log representatif)
    const { error: historyError } = await adminClient.from('generation_history').insert({
      business_id: businessId,
      content_id: contentId || null,
      prompt: `Stock video queries: ${queries.join(', ')}`,
      aspect_ratio: '9:16',
      model: 'pexels/stock',
      image_url: videoUrls[0]
    })
    if (historyError) throw historyError

    revalidatePath(`/dashboard/${businessId}/studio`)
    return { success: true, imageUrls: videoUrls, prompt: queries.join(', '), type: 'video' }

  } catch (error: any) {
    console.error('generateStockVideo Error:', error)
    throw new Error(error.message)
  }
}

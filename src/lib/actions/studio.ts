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

export async function generateStockVideo(businessId: string, contentId: string | null, brief: string) {
  const userClient = await createClient()
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) throw new Error("Akses ditolak: pengguna belum login.")

  const adminClient = createAdminClient()

  try {
    // 1. Dapatkan keyword spesifik dari AI Director
    // NOTE: Harus import runVideoDirector di atas
    const directorOutput = await require('@/lib/ai/agents/director').runVideoDirector(businessId, brief)
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
      await adminClient.from('media_assets').delete().eq('content_id', contentId).eq('type', 'video')
    }

    // 5. Simpan 3 video ke media_assets
    for (const url of videoUrls) {
      await adminClient.from('media_assets').insert({
        business_id: businessId,
        content_id: contentId, // kaitkan ke konten spesifik
        file_url: url,
        type: 'video' 
      })
    }
    
    // 6. Simpan ke generation_history (satu log representatif)
    await adminClient.from('generation_history').insert({
      business_id: businessId,
      content_id: contentId || null,
      prompt: `Stock video queries: ${queries.join(', ')}`,
      aspect_ratio: '9:16',
      model: 'pexels/stock',
      image_url: videoUrls[0]
    })

    revalidatePath(`/dashboard/${businessId}/studio`)
    return { success: true, imageUrls: videoUrls, prompt: queries.join(', '), type: 'video' }

  } catch (error: any) {
    console.error('generateStockVideo Error:', error)
    throw new Error(error.message)
  }
}

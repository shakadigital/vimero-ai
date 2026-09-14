export async function generateImageCloudflare(prompt: string): Promise<Buffer> {
  const paidAiEnabled = process.env.ENABLE_PAID_AI === 'true'
  const ideogramApiKey = process.env.IDEOGRAM_API_KEY || process.env.idiogram_api_key

  // Ideogram is preferred for branded layouts and text-aware image generation.
  if (paidAiEnabled && ideogramApiKey) {
    try {
      const response = await fetch(
        process.env.IDEOGRAM_API_URL || 'https://api.ideogram.ai/v1/ideogram-v3/generate',
        {
          method: 'POST',
          headers: {
            'Api-Key': ideogramApiKey
          },
          body: (() => {
            const formData = new FormData()
            formData.append('image_request', JSON.stringify({
              prompt: prompt.trim(),
              aspect_ratio: 'ASPECT_1_1',
              model: 'V_3',
              magic_prompt_option: 'AUTO',
              num_images: 1
            }))
            return formData
          })()
        }
      )

      if (response.ok) {
        const data = await response.json()
        const imageUrl = data?.data?.[0]?.url
        if (imageUrl) {
          const imageResponse = await fetch(imageUrl)
          if (imageResponse.ok) {
            console.log('Berhasil generate gambar via Ideogram!')
            return Buffer.from(await imageResponse.arrayBuffer())
          }
        }
        console.warn('Ideogram mengembalikan respons tanpa URL gambar. Beralih ke provider berikutnya...')
      } else {
        console.warn(`Ideogram gagal (${response.status}). Beralih ke provider berikutnya...`)
      }
    } catch (ideogramError) {
      console.warn('Gagal memanggil Ideogram. Beralih ke provider berikutnya...', ideogramError)
    }
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const apiToken = process.env.CLOUDFLARE_API_TOKEN
  
  // 1. Coba Cloudflare Workers AI jika kredensial tersedia
  if (paidAiEnabled && accountId && apiToken) {
    try {
      console.log('Mencoba generate gambar via Cloudflare Workers AI...')
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ prompt })
        }
      )

      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer()
        console.log('Berhasil generate gambar via Cloudflare Workers AI!')
        return Buffer.from(arrayBuffer)
      } else {
        const errText = await response.text()
        console.warn(`Cloudflare AI gagal (${response.status}): ${errText}. Beralih ke fallback generator...`)
      }
    } catch (cfError: unknown) {
      const message = cfError instanceof Error ? cfError.message : String(cfError)
      console.warn('Gagal memanggil Cloudflare Workers AI:', message, '. Beralih ke fallback generator...')
    }
  }

  // 2. Fallback otomatis ke High-Res Image Engine (Flux / Stable Diffusion)
  // Menjamin Studio Kreatif selalu berhasil merender gambar tanpa error
  console.log('Menggunakan Fallback Image Engine (Flux / SDXL)...')
  const cleanPrompt = encodeURIComponent(prompt.trim())
  const seed = Math.floor(Math.random() * 1000000)
  const fallbackUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1024&height=1024&nologo=true&model=flux&seed=${seed}`
  
  const fallbackRes = await fetch(fallbackUrl)
  if (!fallbackRes.ok) {
    const errBody = await fallbackRes.text()
    throw new Error(`Gagal menghasilkan gambar dari engine fallback: ${fallbackRes.statusText} - ${errBody}`)
  }

  const arrayBuffer = await fallbackRes.arrayBuffer()
  console.log('Berhasil generate gambar via Fallback Engine!')
  return Buffer.from(arrayBuffer)
}

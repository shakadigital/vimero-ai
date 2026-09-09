export async function generateImageCloudflare(prompt: string): Promise<Buffer> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const apiToken = process.env.CLOUDFLARE_API_TOKEN
  
  // 1. Coba Cloudflare Workers AI jika kredensial tersedia
  if (accountId && apiToken) {
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
    } catch (cfError: any) {
      console.warn('Gagal memanggil Cloudflare Workers AI:', cfError.message, '. Beralih ke fallback generator...')
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

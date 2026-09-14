export interface BufferPublishResult {
  success: boolean;
  external_id?: string;
  error?: string;
  isSimulated?: boolean;
}

export interface BufferProfile {
  id: string
  service: string
  service_username: string
}

export async function getBufferProfiles(token: string): Promise<BufferProfile[]> {
  if (!token || token === 'your-buffer-key' || token.trim() === '') {
    return [
      { id: 'sim-ig-123', service: 'instagram', service_username: 'Simulated IG' },
      { id: 'sim-tt-123', service: 'tiktok', service_username: 'Simulated TikTok' },
      { id: 'sim-fb-123', service: 'facebook', service_username: 'Simulated FB' }
    ]
  }

  const res = await fetch('https://api.bufferapp.com/1/profiles.json', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  if (!res.ok) {
    console.warn('Buffer get profiles error. Menggunakan mock profile.')
    return [
      { id: 'sim-ig-123', service: 'instagram', service_username: 'Simulated IG' }
    ]
  }

  return res.json()
}

export async function publishToBuffer(text: string, _platform: string, imageUrl?: string): Promise<BufferPublishResult> {
  void imageUrl
  const token = process.env.BUFFER_API_KEY
  
  // 1. Jika tidak ada token, gunakan mode simulasi yang mulus
  if (!token || token === 'your-buffer-key' || token.trim() === '') {
    console.log(`[SIMULATED DISPATCH] Mempublikasikan konten ke kanal ${_platform}...`)
    await new Promise(resolve => setTimeout(resolve, 800))
    return {
      success: true,
      external_id: `sim-buf-${Date.now()}`,
      isSimulated: true,
    }
  }

  // 2. Jika token tersedia, coba hubungi Buffer API
  try {
    console.log(`[BUFFER PUBLISHING] Mengirim konten ke ${_platform} via Buffer API...`)
    
    const response = await fetch('https://api.bufferapp.com/1/updates/create.json', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        text: text,
        now: 'true' 
      })
    })

    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        external_id: data.updates?.[0]?.id || `buffer-${Date.now()}`
      }
    }

    const errText = await response.text()
    console.warn(`Buffer API error (${response.status}): ${errText}`)

    return {
      success: false,
      error: `Buffer menolak publikasi (HTTP ${response.status})`
    }

  } catch (err: any) {
    console.warn('Buffer network exception:', err.message)
    return {
      success: false,
      error: 'Buffer tidak dapat dihubungi'
    }
  }
}

export async function scheduleToBuffer(text: string, platform: string, scheduledAt: string): Promise<BufferPublishResult> {
  const token = process.env.BUFFER_API_KEY
  
  if (!token || token === 'your-buffer-key' || token.trim() === '') {
    console.log(`[SIMULATED SCHEDULE] Menjadwalkan konten ke kanal ${platform} untuk ${scheduledAt}...`)
    await new Promise(resolve => setTimeout(resolve, 800))
    return {
      success: true,
      external_id: `sim-sched-${Date.now()}`,
      isSimulated: true,
    }
  }

  try {
    const profiles = await getBufferProfiles(token)
    const targetService = platform.toLowerCase()
    const matchedProfile = profiles.find(p => p.service.toLowerCase() === targetService)
    
    if (!matchedProfile) {
      return {
        success: false,
        error: `Profil Buffer untuk platform ${platform} tidak ditemukan`
      }
    }

    const unixTimestamp = Math.floor(new Date(scheduledAt).getTime() / 1000)

    const response = await fetch('https://api.bufferapp.com/1/updates/create.json', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        text: text,
        'profile_ids[]': matchedProfile.id,
        scheduled_at: unixTimestamp.toString()
      })
    })

    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        external_id: data.updates?.[0]?.id || `buffer-sched-${Date.now()}`
      }
    }

    const errText = await response.text()
    console.warn(`Buffer schedule error (${response.status}): ${errText}`)

    return {
      success: false,
      error: `Buffer menolak penjadwalan (HTTP ${response.status})`
    }

  } catch (err: any) {
    console.warn('Buffer schedule network exception:', err.message)
    return {
      success: false,
      error: 'Buffer tidak dapat dihubungi'
    }
  }
}

export async function deleteFromBuffer(updateId: string): Promise<void> {
  const token = process.env.BUFFER_API_KEY
  
  if (!token || token === 'your-buffer-key' || token.trim() === '' || updateId.startsWith('sim-') || updateId.startsWith('buf-')) {
    console.log(`[SIMULATED CANCEL] Menghapus jadwal konten ${updateId} dari Buffer...`)
    await new Promise(resolve => setTimeout(resolve, 400))
    return
  }

  try {
    const res = await fetch(`https://api.bufferapp.com/1/updates/${updateId}/destroy.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!res.ok) {
      const errText = await res.text()
      console.warn(`Buffer destroy update warning: ${errText}`)
    }
  } catch (err: any) {
    console.warn('Buffer delete network exception:', err.message)
  }
}

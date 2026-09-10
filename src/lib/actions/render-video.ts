'use server'

import path from 'path'
import fs from 'fs'
import { spawn } from 'child_process'
import { createClient } from '@/lib/supabase/server'

// Regex untuk menangkap progres dari log Remotion (misal: "Rendering frames... 150/300")
const PROGRESS_REGEX = /([0-9]+)\/([0-9]+)/

export async function renderVideoAction(
  audioUrl: string | null, 
  title: string, 
  mediaAssets: any[], 
  subtitleData?: any, 
  fullText?: string,
  businessId?: string,
  contentId?: string
) {
  try {
    const supabase = await createClient()

    // 1. Buat record di video_renders
    let renderId: string | null = null;
    
    if (businessId) {
      const { data: renderData, error: insertError } = await supabase
        .from('video_renders')
        .insert({
          business_id: businessId,
          content_id: contentId || null,
          status: 'pending',
          progress: 0
        })
        .select('id')
        .single()
        
      if (!insertError && renderData) {
        renderId = renderData.id;
      }
    }

    const outputDir = path.join(process.cwd(), 'public', 'temp')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    const fileName = `render-${Date.now()}.mp4`
    const outputPath = path.join(outputDir, fileName)

    console.log("Rendering video to", outputPath)
    
    const props = JSON.stringify({ audioUrl, title, mediaAssets, subtitleData, fullText })

    const lastSubtitle = subtitleData && subtitleData.length > 0 ? subtitleData[subtitleData.length - 1] : null;
    const audioDurationMs = lastSubtitle ? (lastSubtitle.offset + lastSubtitle.duration) / 10000 : null;
    const durationInFrames = audioDurationMs ? Math.ceil((audioDurationMs / 1000) * 30) + 30 : (audioUrl ? 900 : 300);

    const propsFileName = `props-${Date.now()}.json`
    const propsPath = path.join(outputDir, propsFileName)
    fs.writeFileSync(propsPath, props, 'utf8')
    
    // Update status ke rendering
    if (renderId) {
      await supabase.from('video_renders').update({ status: 'rendering', progress: 5 }).eq('id', renderId)
    }

    // Jalankan npx remotion render sebagai background process (TIDAK di-await)
    // Menggunakan spawn agar bisa membaca stdout secara real-time
    const child = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', [
      'remotion', 'render', 'src/remotion/index.ts', 'VerticalVideo', outputPath,
      `--props=${propsPath}`,
      `--frames=${durationInFrames}`
    ])

    // Fungsi untuk mengupdate progress secara throttled
    let lastUpdate = Date.now();
    
    child.stdout.on('data', async (data) => {
      const text = data.toString();
      // Contoh log remotion: 15/300 frames (5%)
      const match = text.match(PROGRESS_REGEX);
      if (match && renderId) {
        const currentFrame = parseInt(match[1]);
        const totalFrames = parseInt(match[2]);
        const progress = Math.min(99, Math.floor((currentFrame / totalFrames) * 100));
        
        // Update DB tiap 2 detik saja agar tidak kena limit
        if (Date.now() - lastUpdate > 2000) {
          lastUpdate = Date.now();
          // Gunakan service role atau client yang sama untuk update
          await supabase.from('video_renders').update({ progress }).eq('id', renderId);
        }
      }
    });

    child.stderr.on('data', (data) => {
      console.error(`Remotion Stderr: ${data}`);
    });

    child.on('close', async (code) => {
      try { fs.unlinkSync(propsPath) } catch(e) {}
      
      if (code === 0) {
        console.log("Render completed:", outputPath)
        if (renderId) {
          await supabase.from('video_renders')
            .update({ status: 'completed', progress: 100, file_url: `/temp/${fileName}` })
            .eq('id', renderId);
        }
      } else {
        console.error("Render failed with code", code)
        if (renderId) {
          await supabase.from('video_renders')
            .update({ status: 'failed', error_message: `Proses render gagal (exit code: ${code})` })
            .eq('id', renderId);
        }
      }
    });

    child.on('error', async (err) => {
      console.error("Failed to start child process.", err);
      try { fs.unlinkSync(propsPath) } catch(e) {}
      if (renderId) {
        await supabase.from('video_renders')
          .update({ status: 'failed', error_message: err.message })
          .eq('id', renderId);
      }
    });

    // Langsung return ke client, tidak menunggu child process selesai!
    return { success: true, message: "Proses render dimulai di latar belakang", renderId }
  } catch (error: any) {
    console.error("Render initiation error:", error)
    return { success: false, error: error.message }
  }
}

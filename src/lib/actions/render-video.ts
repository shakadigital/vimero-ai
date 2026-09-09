'use server'

import path from 'path'
import fs from 'fs'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function renderVideoAction(audioUrl: string | null, title: string, mediaAssets: any[]) {
  try {
    const outputDir = path.join(process.cwd(), 'public', 'temp')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    const fileName = `render-${Date.now()}.mp4`
    const outputPath = path.join(outputDir, fileName)

    console.log("Rendering video to", outputPath)
    
    // Siapkan props sebagai string JSON
    const props = JSON.stringify({
      audioUrl,
      title,
      mediaAssets
    })

    // Escape props untuk CLI (Windows command prompt sering bermasalah dengan tanda kutip ganda, jadi kita encode sebagai base64 atau escape)
    // Cara paling aman di CLI adalah menulis props ke file sementara JSON, lalu pass --props=./temp.json
    const propsFileName = `props-${Date.now()}.json`
    const propsPath = path.join(outputDir, propsFileName)
    fs.writeFileSync(propsPath, props, 'utf8')
    
    // Jalankan npx remotion render CLI
    // Karena user menggunakan Windows, kita gunakan command yang aman
    const cmd = `npx remotion render src/remotion/index.ts VerticalVideo "${outputPath}" --props="${propsPath}"`
    
    console.log("Executing:", cmd)
    const { stdout, stderr } = await execAsync(cmd)
    
    console.log("Render stdout:", stdout)
    if (stderr) {
      console.error("Render stderr:", stderr)
    }
    
    // Bersihkan file props sementara
    try {
      fs.unlinkSync(propsPath)
    } catch(e) {}
    
    return { success: true, url: `/temp/${fileName}` }
  } catch (error: any) {
    console.error("Render error:", error)
    return { success: false, error: error.message }
  }
}

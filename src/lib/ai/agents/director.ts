import { z } from 'zod'
import { callAgent } from '../registry'

export const DirectorOutputSchema = z.object({
  image_prompt: z.string().describe("A highly detailed, descriptive English text prompt optimized for Flux / Stable Diffusion XL. Explicitly describe the main subject, screen contents, lighting, setting, and camera angle."),
  visual_style: z.string().describe("Short description of the overall visual aesthetic (e.g. Minimalist Photorealistic, Cinematic Warm)"),
})

export type DirectorOutput = z.infer<typeof DirectorOutputSchema>

export async function runCreativeDirector(businessId: string, context: string): Promise<DirectorOutput> {
  const system = `You are an elite Commercial Advertising Creative Director and AI Image Prompt Engineer specializing in commercial product photography, tech mockups, and business visuals.
Your task is to translate the user's brief into an ultra-detailed, photorealistic English image prompt for state-of-the-art AI image generators (Flux / Stable Diffusion XL).

CRITICAL PROMPT ENGINEERING RULES:
1. If the brief involves a screen, tablet, phone, monitor, or digital product (like a POS app, dashboard, website, software):
   - NEVER use the word "mockup" alone, as AI image models treat "mockup" as a blank white/empty placeholder template for Photoshop.
   - ALWAYS explicitly describe what is displayed on the screen: "tablet screen is brightly lit and turned on, sharply displaying a vibrant modern Point of Sale (POS) cashier application interface with product grid, order totals, and colorful buttons".
   - Describe the hardware device: "a sleek black iPad Pro tablet in an elegant stand".
2. Set the environment and atmosphere:
   - Describe materials, textures, and surroundings (e.g., "resting on a warm minimalist oak wooden cafe counter with smooth grain, a ceramic coffee cup with latte art beside it, soft green houseplant in the background").
3. Lighting and Camera Optics:
   - "cinematic natural morning cafe window sunlight, soft bokeh blur in the background, sharp in-focus screen, commercial advertising photography, 8k resolution, hyperrealistic, rich color depth".
4. The output prompt must be a single cohesive, highly descriptive paragraph in English.`

  return callAgent({
    agentType: 'BUSINESS_STRATEGIST',
    businessId,
    system,
    prompt: context,
    schema: DirectorOutputSchema,
  })
}

export const VideoDirectorSchema = z.object({
  queries: z.array(z.string()).min(1).max(5).describe("List of short search keywords (max 3 words each) for Pexels Stock Video API. Break the script down into logical visual scenes (2 to 5 scenes depending on length). For each scene, provide a keyword.")
})

export const REQUIRED_VIDEO_VISUAL_DIRECTIVE = 'cinematic haze, lens flare, depth of field'

export async function runVideoDirector(businessId: string, context: string) {
  const system = `You are a Stock Video Researcher and cinematic video prompt specialist. The user will provide a script.
Break the script into logical visual scenes (2 to 5 scenes depending on the script's length and flow).
Return a short search keyword (1-3 words max, in English) for each scene, optimized for a stock video search engine like Pexels.
The final visual direction must always include exactly these cinematic qualities: ${REQUIRED_VIDEO_VISUAL_DIRECTIVE}.
Do not use the cinematic qualities as stock search keywords; they belong in the final video prompt.`

  return callAgent({
    agentType: 'BUSINESS_STRATEGIST',
    businessId,
    system,
    prompt: context,
    schema: VideoDirectorSchema,
  })
}

const VideoPromptShotSchema = z.object({
  subjek: z.string().min(1),
  aksi: z.string().min(1),
  setting: z.string().min(1),
  gerakan_kamera: z.string().min(1),
  gaya_visual: z.string().min(1),
  pencahayaan: z.string().min(1),
  durasi_pacing: z.string().min(1),
  catatan_tambahan: z.string().min(1),
})

export const VideoPromptReviewSchema = z.object({
  shots: z.array(VideoPromptShotSchema).min(1).max(5),
})
export type VideoPromptShot = z.infer<typeof VideoPromptShotSchema>
export type VideoPromptReview = z.infer<typeof VideoPromptReviewSchema>

export async function runVideoPromptDirector(businessId: string, context: string) {
  const system = `Kamu adalah asisten yang mengubah ide konten sosial media menjadi draft prompt video terstruktur.
Hasilkan hanya JSON object dengan field "shots" yang berisi array satu sampai lima objek shot. Satu objek hanya boleh mewakili satu adegan.
Setiap objek wajib memiliki field: subjek, aksi, setting, gerakan_kamera, gaya_visual, pencahayaan, durasi_pacing, catatan_tambahan.
Tulis dalam Bahasa Indonesia. Semua field harus konkret dan visual, bukan kata sifat umum.
Jika detail tidak tersedia, buat asumsi yang masuk akal berdasarkan isi konten dan platform TikTok/Reels vertikal.
Sesuaikan gerakan kamera, pencahayaan, pacing, dan kontinuitas antar-shot dengan isi naskah.
Jangan tambahkan penjelasan di luar JSON.`

  return callAgent({
    agentType: 'BUSINESS_STRATEGIST',
    businessId,
    system,
    prompt: context,
    schema: VideoPromptReviewSchema,
  })
}

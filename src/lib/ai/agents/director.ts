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

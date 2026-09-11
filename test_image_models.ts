import puter from '@heyputer/puter.js';

async function checkImageModels() {
  try {
    const models = await puter.ai.listModels();
    const imageModels = models.filter((m: any) => 
       m.modalities?.output?.includes('image') || 
       m.id.includes('dall-e') || 
       m.id.includes('sdxl') ||
       m.id.includes('stable-diffusion')
    );
    console.log("Image Models:");
    imageModels.forEach((m: any) => console.log(m.id, m.costs?.completion_tokens, m.provider));
  } catch (error) {
    console.error("Error:", error);
  }
}
checkImageModels();

import puter from '@heyputer/puter.js';

async function checkModels() {
  try {
    const models = await puter.ai.listModels();
    console.log("Models:", models);
  } catch (error) {
    console.error("Error:", error);
  }
}
checkModels();

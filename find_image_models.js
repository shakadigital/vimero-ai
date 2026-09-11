const puter = require('@heyputer/puter.js').default || require('@heyputer/puter.js');
const fs = require('fs');

async function findModels() {
  try {
    const models = await puter.ai.listModels();
    let matches = [];
    models.forEach(m => {
      // Check if it's an image model
      if (m.modalities?.output?.includes('image') || m.id.toLowerCase().includes('dall') || m.id.toLowerCase().includes('stable') || m.id.toLowerCase().includes('flux')) {
        matches.push(m.id);
      }
    });
    console.log("Found Image Models:", matches);
  } catch(e) {
    console.error(e);
  }
}
findModels();

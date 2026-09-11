import puter from '@heyputer/puter.js';

async function testTxt2Img() {
  try {
    const res = await puter.ai.txt2img("A cute cat");
    console.log("Response:", res);
  } catch (error) {
    console.error("Error:", error);
  }
}
testTxt2Img();

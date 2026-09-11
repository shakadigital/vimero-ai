import puter from '@heyputer/puter.js';

async function testTxt2Vid() {
  try {
    const res = await puter.ai.txt2vid("A cat playing the piano");
    console.log("Response:", res);
  } catch (error) {
    console.error("Error:", error);
  }
}
testTxt2Vid();

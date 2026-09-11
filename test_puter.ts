import puter from '@heyputer/puter.js';

async function testPuter() {
  console.log("Puter AI properties:", Object.keys(puter.ai || {}));
}
testPuter();

const { Jimp } = require('jimp');

async function extractProperFrames() {
  const image = await Jimp.read('src/assets/teacher_peach.png');
  const w = image.bitmap.width;
  
  const cellW = Math.floor(w / 6);
  
  const row2Y = 218, row2H = 202;
  const row4Y = 536, row4H = 254;
  
  for (let c = 0; c < 6; c++) {
    const r4 = image.clone().crop({ x: c * cellW, y: row4Y, w: cellW, h: row4H });
    await r4.write(`C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\a51ce1d0-4845-4752-aa34-a2ba44c0ce06\\proper_r4_c${c}.png`);
  }
}
extractProperFrames().catch(console.error);

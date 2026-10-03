const { Jimp } = require('jimp');

async function analyzeTeacherFrames() {
  const image = await Jimp.read('src/assets/teacher_peach.png');
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  
  const cellW = Math.floor(w / 6);
  const cellH = Math.floor(h / 5);
  
  // Row 4 is index 3 or 4? The rows are 1, 2, 3, 4, 5. So index 3.
  // Wait, let's just extract all frames from index 1 (Row 2) and index 3 (Row 4)
  
  for (let c = 0; c < 6; c++) {
    const r2 = image.clone().crop({ x: c * cellW, y: cellH, w: cellW, h: cellH });
    await r2.write(`C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\a51ce1d0-4845-4752-aa34-a2ba44c0ce06\\r2_c${c}.png`);
    
    const r4 = image.clone().crop({ x: c * cellW, y: cellH * 3, w: cellW, h: cellH });
    await r4.write(`C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\a51ce1d0-4845-4752-aa34-a2ba44c0ce06\\r4_c${c}.png`);
  }
}
analyzeTeacherFrames().catch(console.error);

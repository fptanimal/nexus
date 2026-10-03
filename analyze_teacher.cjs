const { Jimp } = require('jimp');
const fs = require('fs');

async function analyzeTeacher() {
  const image = await Jimp.read('src/assets/teacher_peach.png');
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  
  const cellW = Math.floor(w / 6);
  const cellH = Math.floor(h / 5);
  
  // Extract row 2 (index 1) and row 4 (index 3)
  const row2 = image.clone().crop({ x: 0, y: cellH, w, h: cellH });
  await row2.write('C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\a51ce1d0-4845-4752-aa34-a2ba44c0ce06\\teacher_row2.png');
  
  const row4 = image.clone().crop({ x: 0, y: cellH * 3, w, h: cellH });
  await row4.write('C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\a51ce1d0-4845-4752-aa34-a2ba44c0ce06\\teacher_row4.png');
  
  console.log("Extracted row 2 and 4");
}

analyzeTeacher().catch(console.error);

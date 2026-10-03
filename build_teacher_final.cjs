const { Jimp } = require('jimp');
const fs = require('fs');

async function buildFinalTeacher() {
  const img = await Jimp.read('C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\a51ce1d0-4845-4752-aa34-a2ba44c0ce06\\teacher_bg_removed.png');
  const w = img.bitmap.width;
  const cellW = Math.floor(w / 6);
  
  // From our row analysis:
  const r1Y = 8, r1H = 202; // Down
  const r2Y = 218, r2H = 202; // Side view
  const r5Y = 809, r5H = 215; // Up
  
  const frames = [];
  
  function getCropped(x, y, cw, ch) {
    const clone = img.clone().crop({ x, y, w: cw, h: ch });
    // find bounding box manually since jimp autocrop can be unpredictable
    let minX = cw, minY = ch, maxX = 0, maxY = 0;
    for (let py = 0; py < ch; py++) {
      for (let px = 0; px < cw; px++) {
        const idx = (py * cw + px) * 4;
        const a = clone.bitmap.data[idx+3];
        if (a > 0) {
          if (px < minX) minX = px;
          if (px > maxX) maxX = px;
          if (py < minY) minY = py;
          if (py > maxY) maxY = py;
        }
      }
    }
    if (maxX < minX) return null; // empty
    return clone.crop({ x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 });
  }

  // Row 1: Down
  for (let c = 0; c < 6; c++) {
    frames.push({ row: 0, img: getCropped(c * cellW, r1Y, cellW, r1H) });
  }
  
  // Row 3: Up (from r5)
  for (let c = 0; c < 6; c++) {
    frames.push({ row: 3, img: getCropped(c * cellW, r5Y, cellW, r5H) });
  }
  
  // Row 2: Right (assembled from original R2)
  // R2 C1 is Idle Right
  // R2 C0 is Step A Right
  // R2 C2 is Step B Right
  const idleR = getCropped(1 * cellW, r2Y, cellW, r2H);
  const stepAR = getCropped(0 * cellW, r2Y, cellW, r2H);
  const stepBR = getCropped(2 * cellW, r2Y, cellW, r2H);
  
  // Sequence: Idle, Step A, Idle, Step B, Idle, Step A
  const rightFrames = [idleR, stepAR, idleR, stepBR, idleR, stepAR];
  rightFrames.forEach(img => frames.push({ row: 2, img }));
  
  // Row 1: Left (mirrored Right)
  rightFrames.forEach(img => {
    const mirrored = img.clone();
    mirrored.flip({ horizontal: true, vertical: false });
    frames.push({ row: 1, img: mirrored });
  });
  
  // Find max dimensions
  let maxW = 0, maxH = 0;
  frames.forEach(f => {
    if (f.img) {
      if (f.img.bitmap.width > maxW) maxW = f.img.bitmap.width;
      if (f.img.bitmap.height > maxH) maxH = f.img.bitmap.height;
    }
  });
  
  // Create final sprite sheet: 4 rows, 6 cols
  const finalW = maxW * 6;
  const finalH = maxH * 4;
  const finalSheet = new Jimp({ width: finalW, height: finalH });
  
  // Track col index for each row
  const colIndex = [0, 0, 0, 0];
  
  for (const f of frames) {
    if (!f.img) continue;
    const r = f.row;
    const c = colIndex[r]++;
    
    // Bottom anchor
    const x = c * maxW + Math.floor((maxW - f.img.bitmap.width) / 2);
    const y = r * maxH + (maxH - f.img.bitmap.height);
    
    finalSheet.composite(f.img, x, y);
  }
  
  await finalSheet.write('src/assets/teacher_final.png');
  console.log(`Final sprite sheet generated. Canvas: ${finalW}x${finalH}, Frame: ${maxW}x${maxH}`);
}

buildFinalTeacher().catch(console.error);

const { Jimp } = require('jimp');

async function buildMotherSprite() {
  const image = await Jimp.read('src/assets/mother_magenta.png');
  const w = image.bitmap.width;
  const h = image.bitmap.height;

  // 1. CLEANUP (Magenta, Green artifacts, Shadow)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const r = image.bitmap.data[idx];
      const g = image.bitmap.data[idx+1];
      const b = image.bitmap.data[idx+2];
      
      // Magenta / thin pink edges
      const distMagenta = Math.sqrt(Math.pow(r - 255, 2) + Math.pow(g - 0, 2) + Math.pow(b - 255, 2));
      if (distMagenta < 120 || (r > 150 && b > 150 && g < 100)) {
        image.bitmap.data[idx+3] = 0;
        continue;
      }
    }
  }

  // 4 columns x 5 rows
  const cellW = Math.floor(w / 4);
  const cellH = Math.floor(h / 5);

  // We need row 0, row 2, row 3 (0-indexed)
  const rowsToExtract = [0, 2, 3];
  
  const frames = [];
  let maxW = 0, maxH = 0;
  
  for (let rIdx = 0; rIdx < rowsToExtract.length; rIdx++) {
    const r = rowsToExtract[rIdx];
    for (let c = 0; c < 4; c++) {
      let minX = 9999, minY = 9999, maxX = -1, maxY = -1;
      const sx = Math.floor(c * cellW);
      const ex = Math.floor((c + 1) * cellW);
      const sy = Math.floor(r * cellH);
      const ey = Math.floor((r + 1) * cellH);
      
      for (let y = sy; y < ey; y++) {
        for (let x = sx; x < ex; x++) {
          const idx = (y * w + x) * 4;
          const a = image.bitmap.data[idx+3];
          if (a > 0) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      
      let fw = maxX - minX + 1;
      let fh = maxY - minY + 1;
      if (minX > maxX) { fw = 0; fh = 0; }
      
      if (fw > maxW) maxW = fw;
      if (fh > maxH) maxH = fh;
      
      if (fw > 0) {
        const frameImg = image.clone();
        frameImg.crop({ x: minX, y: minY, w: fw, h: fh });
        frames.push({ outR: rIdx, c, fw, fh, img: frameImg });
      }
    }
  }
  
  maxW += 4; 
  maxH += 4;

  const outImage = new Jimp({ width: maxW * 4, height: maxH * 3, color: 0x00000000 });

  for (const frame of frames) {
    const drawX = frame.c * maxW + Math.floor((maxW - frame.fw) / 2);
    const drawY = frame.outR * maxH + (maxH - frame.fh); // Bottom anchored!
    outImage.blit({ src: frame.img, x: drawX, y: drawY });
  }

  await outImage.write('src/assets/mother_final.png');
  console.log("Created mother_final.png. Max frame size: " + maxW + "x" + maxH);
}
buildMotherSprite().catch(console.error);

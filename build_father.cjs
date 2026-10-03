const { Jimp } = require('jimp');

async function buildFatherSprite() {
  const image = await Jimp.read('src/assets/father_magenta.png');
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

      // Green artifacts
      if (g > r + 20 && g > 80) {
        image.bitmap.data[idx+3] = 0;
        continue;
      }

      // Shadow (grey pixels near bottom). Typically r, g, b ~ 120-130
      if (r > 90 && r < 150 && g > 90 && g < 150 && Math.abs(r-g) < 20 && Math.abs(g-b) < 20) {
        image.bitmap.data[idx+3] = 0;
        continue;
      }
    }
  }

  // 2. FIX STAR (Row 2, Col 5)
  // The star is a bright spot on the shoulder.
  // We'll look for bright pixels in the top-right of that cell.
  const cellW = Math.floor(w / 6);
  const cellH = Math.floor(h / 3);
  
  const startX = 5 * cellW;
  const startY = 2 * cellH;
  for (let y = startY; y < startY + cellH/2; y++) {
    for (let x = startX + cellW/2; x < startX + cellW; x++) {
      const idx = (y * w + x) * 4;
      const r = image.bitmap.data[idx];
      if (r > 200) { // bright star pixel
        // Overwrite with a pixel from the left (the shirt color)
        const srcIdx = (y * w + (x - 20)) * 4; // grab from 20px left
        image.bitmap.data[idx] = image.bitmap.data[srcIdx];
        image.bitmap.data[idx+1] = image.bitmap.data[srcIdx+1];
        image.bitmap.data[idx+2] = image.bitmap.data[srcIdx+2];
        image.bitmap.data[idx+3] = image.bitmap.data[srcIdx+3];
      }
    }
  }

  // 3. FIND BOUNDING BOXES FOR 18 FRAMES
  const frames = [];
  let maxW = 0, maxH = 0;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 6; c++) {
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
      
      const fw = maxX - minX + 1;
      const fh = maxY - minY + 1;
      if (fw > maxW) maxW = fw;
      if (fh > maxH) maxH = fh;
      
      // Crop the frame
      const frameImg = image.clone();
      frameImg.crop({ x: minX, y: minY, w: fw, h: fh });
      frames.push({ r, c, fw, fh, img: frameImg });
    }
  }
  
  // Padding
  maxW += 4; 
  maxH += 4;

  // 4. MAP TO DIRECTIONS
  // DOWN: row 0 [0..5]
  // RIGHT: row 1 cols [0, 1, 3, 4]
  // LEFT: row 1 cols [2, 5]
  // UP: row 2 [0..5]
  const downFrames = frames.filter(f => f.r === 0);
  const upFrames = frames.filter(f => f.r === 2);
  const rightFrames = frames.filter(f => f.r === 1 && [0, 1, 3, 4].includes(f.c));
  const leftFrames = frames.filter(f => f.r === 1 && [2, 5].includes(f.c));

  // Let's create a 4x6 output grid.
  // We'll loop the frames to fill 6 slots for each direction.
  const outW = maxW * 6;
  const outH = maxH * 4;
  const outImage = new Jimp({ width: outW, height: outH, color: 0x00000000 });

  const rows = [downFrames, leftFrames, rightFrames, upFrames];
  for (let r = 0; r < 4; r++) {
    const srcList = rows[r];
    for (let c = 0; c < 6; c++) {
      const srcFrame = srcList[c % srcList.length];
      
      // Draw bottom-anchored, horizontally centered
      const drawX = c * maxW + Math.floor((maxW - srcFrame.fw) / 2);
      const drawY = r * maxH + (maxH - srcFrame.fh); // Bottom anchored!
      
      outImage.blit({ src: srcFrame.img, x: drawX, y: drawY });
    }
  }

  await outImage.write('src/assets/father_final.png');
  console.log("Created normalized father_final.png");
}
buildFatherSprite().catch(console.error);

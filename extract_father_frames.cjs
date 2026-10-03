const { Jimp } = require('jimp');

async function extractFatherFrames() {
  const image = await Jimp.read('src/assets/father_cleaned.png');
  const cellW = image.bitmap.width / 6;
  const cellH = image.bitmap.height / 3;
  
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 6; c++) {
      let minX = 9999, minY = 9999, maxX = -1, maxY = -1;
      
      const startX = Math.floor(c * cellW);
      const endX = Math.floor((c + 1) * cellW);
      const startY = Math.floor(r * cellH);
      const endY = Math.floor((r + 1) * cellH);
      
      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const idx = (y * image.bitmap.width + x) * 4;
          const a = image.bitmap.data[idx+3];
          
          if (a > 0) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      
      console.log(`Row ${r}, Col ${c}: bounds x=${minX}-${maxX}, y=${minY}-${maxY} (width=${maxX-minX+1}, height=${maxY-minY+1})`);
    }
  }
}
extractFatherFrames().catch(console.error);

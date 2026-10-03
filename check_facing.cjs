const { Jimp } = require('jimp');

async function checkFacing() {
  const image = await Jimp.read('src/assets/father_cleaned.png');
  const cellW = image.bitmap.width / 6;
  const cellH = image.bitmap.height / 3;
  
  for (let c = 0; c < 6; c++) {
    const startX = Math.floor(c * cellW);
    const endX = Math.floor((c + 1) * cellW);
    const startY = Math.floor(1 * cellH); // Row 1 (middle row)
    const endY = Math.floor(2 * cellH);
    
    let skinTotalX = 0, skinCount = 0;
    let hairTotalX = 0, hairCount = 0;
    
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const idx = (y * image.bitmap.width + x) * 4;
        const r = image.bitmap.data[idx];
        const g = image.bitmap.data[idx+1];
        const b = image.bitmap.data[idx+2];
        const a = image.bitmap.data[idx+3];
        
        if (a > 0) {
          // Identify skin tone (high R, high G, lower B)
          // Usually something like R>180, G>150, B<150
          if (r > 150 && g > 120 && b < 100) {
            skinTotalX += x;
            skinCount++;
          }
          // Identify grey hair (R~G~B, let's say diff < 20, value > 80 and < 150)
          const diff = Math.max(Math.abs(r-g), Math.abs(g-b), Math.abs(r-b));
          if (diff < 20 && r > 80 && r < 180) {
            hairTotalX += x;
            hairCount++;
          }
        }
      }
    }
    
    const skinAvgX = skinCount > 0 ? skinTotalX / skinCount : 0;
    const hairAvgX = hairCount > 0 ? hairTotalX / hairCount : 0;
    
    const facing = skinAvgX > hairAvgX ? 'RIGHT' : 'LEFT';
    
    console.log(`Col ${c}: SkinAvgX=${skinAvgX.toFixed(1)}, HairAvgX=${hairAvgX.toFixed(1)} -> Facing ${facing}`);
  }
}
checkFacing().catch(console.error);

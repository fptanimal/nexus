const { Jimp } = require('jimp');

async function extract() {
  const image = await Jimp.read('public/images/doctor_sprite.png');
  const cellW = 256;
  const cellH = 256;
  
  const directions = ['down', 'left', 'right', 'up'];
  
  for (let r = 0; r < 4; r++) {
    // Only extract standing frame (col 0)
    let c = 0;
    let minX = 9999, minY = 9999, maxX = -1, maxY = -1;
    for (let y = r * cellH; y < (r + 1) * cellH; y++) {
      for (let x = c * cellW; x < (c + 1) * cellW; x++) {
        const idx = (y * 1024 + x) * 4;
        const rVal = image.bitmap.data[idx];
        const gVal = image.bitmap.data[idx+1];
        const bVal = image.bitmap.data[idx+2];
        const aVal = image.bitmap.data[idx+3];
        
        // Ignore near-white pixels and transparent pixels
        if (aVal > 0 && !(rVal > 200 && gVal > 200 && bVal > 200)) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    
    console.log(`Row ${r} bounds: x=${minX}-${maxX}, y=${minY}-${maxY}`);
    
    if (minX <= maxX && minY <= maxY) {
      const clone = image.clone();
      let cropX = Math.max(0, minX - 2);
      let cropY = Math.max(0, minY - 2);
      let cropW = (maxX - minX + 1) + 4;
      let cropH = (maxY - minY + 1) + 4;
      clone.crop({x: cropX, y: cropY, w: cropW, h: cropH});
      
      // Also make near-white transparent in the cropped image
      clone.scan(0, 0, clone.bitmap.width, clone.bitmap.height, function(x, y, idx) {
        const rVal = this.bitmap.data[idx];
        const gVal = this.bitmap.data[idx+1];
        const bVal = this.bitmap.data[idx+2];
        if (rVal > 200 && gVal > 200 && bVal > 200) {
          this.bitmap.data[idx+3] = 0;
        }
      });
      
      clone.write(`public/images/doctor_${directions[r]}.png`);
    }
  }
}
extract();

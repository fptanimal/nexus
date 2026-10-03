const { Jimp } = require('jimp');

async function findWatermark() {
  const image = await Jimp.read('C:/Users/Admin/.gemini/antigravity-ide/brain/e9ef84e2-873e-4a74-864b-9cd07a960699/.user_uploaded/media_1790864516531.png');
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  
  const whitePixels = [];
  for (let y = h/2; y < h; y++) {
    for (let x = w/2; x < w; x++) {
      const hex = image.getPixelColor(x, y);
      const r = (hex >> 24) & 255;
      const g = (hex >> 16) & 255;
      const b = (hex >> 8) & 255;
      
      if (r > 230 && g > 230 && b > 230) {
         whitePixels.push({x: Math.floor(x), y: Math.floor(y)});
      }
    }
  }
  
  console.log(`Found ${whitePixels.length} white pixels.`);
  
  // Find bounding box of these white pixels
  if (whitePixels.length > 0) {
    let minX = w, maxX = 0, minY = h, maxY = 0;
    for (const p of whitePixels) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    console.log(`Watermark bounds: X[${minX}..${maxX}], Y[${minY}..${maxY}]`);
  }
}

findWatermark();

const { Jimp } = require('jimp');

async function findRoof() {
  const image = await Jimp.read('src/assets/overload_house_final.png');
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  
  let roofTop = h;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const hex = image.getPixelColor(x, y);
      const r = (hex >> 24) & 255;
      const g = (hex >> 16) & 255;
      const b = (hex >> 8) & 255;
      const a = hex & 255;
      
      // Look for red roof color (r > 120, r > g + 40, r > b + 40)
      if (a > 0 && r > 120 && r > g + 40 && r > b + 40) {
        if (y < roofTop) roofTop = y;
      }
    }
  }
  
  console.log(`Roof starts at y=${roofTop}`);
}

findRoof();

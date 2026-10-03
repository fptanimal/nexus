const { Jimp } = require('jimp');

async function findGreyPixels() {
  const image = await Jimp.read('src/assets/overload_house_final.png');
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  
  let greyPixels = [];
  for (let y = 0; y < 20; y++) {
    for (let x = 0; x < w; x++) {
      const hex = image.getPixelColor(x, y);
      const r = (hex >> 24) & 255;
      const g = (hex >> 16) & 255;
      const b = (hex >> 8) & 255;
      const a = hex & 255;
      if (a === 255 && Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && r < 180) {
        greyPixels.push({x, y, r, g, b});
      }
    }
  }
  
  console.log(`Found ${greyPixels.length} grey pixels in top 20 rows.`);
  if (greyPixels.length > 0) {
    console.log(`First few: `, greyPixels.slice(0, 5));
    console.log(`Last few: `, greyPixels.slice(-5));
  }
}

findGreyPixels();

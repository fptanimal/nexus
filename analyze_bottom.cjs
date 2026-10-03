const { Jimp } = require('jimp');

async function analyzeBottom() {
  const image = await Jimp.read('src/assets/overload_house_final.png');
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  
  let bottomPixels = {};
  for(let y=500; y<h; y++) {
    const hex = image.getPixelColor(w/2, y);
    const r = (hex >> 24) & 255;
    const g = (hex >> 16) & 255;
    const b = (hex >> 8) & 255;
    const a = hex & 255;
    if (a > 0) {
      const color = `${r},${g},${b}`;
      bottomPixels[y] = color;
    }
  }
  console.log('Center pixels at bottom:', bottomPixels);
}

analyzeBottom();

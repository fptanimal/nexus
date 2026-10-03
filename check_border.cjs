const { Jimp } = require('jimp');

async function checkBorderThickness() {
  const image = await Jimp.read('src/assets/overload_house_final.png');
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  
  for (let y = 0; y < 10; y++) {
    const hex = image.getPixelColor(w/2, y);
    const r = (hex >> 24) & 255;
    const g = (hex >> 16) & 255;
    const b = (hex >> 8) & 255;
    const a = hex & 255;
    console.log(`[x=${w/2}, y=${y}]: R:${r} G:${g} B:${b} A:${a}`);
  }
}

checkBorderThickness();

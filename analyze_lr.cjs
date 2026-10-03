const { Jimp } = require('jimp');

async function analyzeLeftRight() {
  const image = await Jimp.read('src/assets/overload_house_final.png');
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  const y = 250;
  
  let leftPixels = {};
  for(let x=0; x<50; x++) {
    const hex = image.getPixelColor(x, y);
    const a = hex & 255;
    if (a > 0) {
      leftPixels[x] = `${(hex >> 24) & 255},${(hex >> 16) & 255},${(hex >> 8) & 255}`;
    }
  }
  console.log('Left pixels at y=250:', leftPixels);
  
  let rightPixels = {};
  for(let x=w-50; x<w; x++) {
    const hex = image.getPixelColor(x, y);
    const a = hex & 255;
    if (a > 0) {
      rightPixels[x] = `${(hex >> 24) & 255},${(hex >> 16) & 255},${(hex >> 8) & 255}`;
    }
  }
  console.log('Right pixels at y=250:', rightPixels);
}

analyzeLeftRight();

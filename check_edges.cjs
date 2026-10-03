const { Jimp } = require('jimp');

async function checkEdges() {
  const image = await Jimp.read('src/assets/overload_house_final.png');
  const w = image.bitmap.width;
  const h = image.bitmap.height;

  let topEdgeCount = 0;
  for (let x = 0; x < w; x++) {
    const hex = image.getPixelColor(x, 0);
    const a = hex & 0xff;
    if (a !== 0) topEdgeCount++;
  }
  
  let bottomEdgeCount = 0;
  for (let x = 0; x < w; x++) {
    const hex = image.getPixelColor(x, h - 1);
    const a = hex & 0xff;
    if (a !== 0) bottomEdgeCount++;
  }

  let leftEdgeCount = 0;
  for (let y = 0; y < h; y++) {
    const hex = image.getPixelColor(0, y);
    const a = hex & 0xff;
    if (a !== 0) leftEdgeCount++;
  }

  let rightEdgeCount = 0;
  for (let y = 0; y < h; y++) {
    const hex = image.getPixelColor(w - 1, y);
    const a = hex & 0xff;
    if (a !== 0) rightEdgeCount++;
  }

  console.log(`Top edge non-transparent pixels: ${topEdgeCount}`);
  console.log(`Bottom edge non-transparent pixels: ${bottomEdgeCount}`);
  console.log(`Left edge non-transparent pixels: ${leftEdgeCount}`);
  console.log(`Right edge non-transparent pixels: ${rightEdgeCount}`);
}

checkEdges();

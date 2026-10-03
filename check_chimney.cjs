const { Jimp } = require('jimp');

async function checkChimney() {
  const image = await Jimp.read('src/assets/overload_house_final.png');
  const w = image.bitmap.width;
  
  let housePixels = [];
  for(let y=0; y<50; y++) {
    for(let x=38; x<517; x++) {
      const hex = image.getPixelColor(x, y);
      const r = (hex >> 24) & 255;
      const g = (hex >> 16) & 255;
      const b = (hex >> 8) & 255;
      const a = hex & 255;
      
      if (a > 0) {
         const isGreen = g > r + 15 && g > b + 15;
         const isDarkGrey = r < 125 && g < 130 && b < 140 && Math.abs(r-g) < 20 && Math.abs(g-b) < 20;
         
         if (!isGreen && !isDarkGrey) {
           housePixels.push(`y=${y}, x=${x}: R${r} G${g} B${b}`);
         }
      }
    }
  }
  console.log(`Found ${housePixels.length} potential house pixels above y=50`);
  if (housePixels.length > 0) {
    console.log(housePixels.slice(0, 10));
    console.log(housePixels.slice(-10));
  }
}

checkChimney();

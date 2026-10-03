const { Jimp } = require('jimp');

async function analyzeTop() {
  const image = await Jimp.read('src/assets/overload_house_final.png');
  const w = image.bitmap.width;
  
  let nonTransparent = 0;
  for(let y=0; y<50; y++) {
    for(let x=0; x<w; x++) {
       const hex = image.getPixelColor(x, y);
       if ((hex & 255) !== 0) {
         nonTransparent++;
       }
    }
  }
  console.log(`Non-transparent pixels in top 50 rows: ${nonTransparent}`);
}

analyzeTop();

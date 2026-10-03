const { Jimp } = require('jimp');

async function findEdges() {
  const image = await Jimp.read('src/assets/overload_house_final.png');
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  
  let leftEdge = w;
  let rightEdge = 0;
  let bottomEdge = 0;
  
  for(let y=0; y<h; y++) {
    for(let x=0; x<w; x++) {
       const hex = image.getPixelColor(x, y);
       const r = (hex >> 24) & 255;
       const g = (hex >> 16) & 255;
       const b = (hex >> 8) & 255;
       const a = hex & 255;
       
       if (a > 0) {
         // Is it part of the house?
         // Red roof, cream wall, brown door, light blue window, grey foundation
         // Let's just find the leftmost and rightmost house pixel.
         // Cream wall: ~255, 237, 185
         // Red roof: ~153, 27, 27
         // Grey foundation: ~150-180
         // We can exclude green and dark grey
         const isGreen = g > r + 15 && g > b + 15;
         const isDarkGrey = r < 120 && g < 120 && b < 130 && Math.abs(r-g) < 20 && Math.abs(g-b) < 20;
         
         if (!isGreen && !isDarkGrey) {
           if (x < leftEdge) leftEdge = x;
           if (x > rightEdge) rightEdge = x;
           if (y > bottomEdge) bottomEdge = y;
         }
       }
    }
  }
  console.log(`House horizontal bounds: left=${leftEdge}, right=${rightEdge}, bottom=${bottomEdge}`);
}

findEdges();

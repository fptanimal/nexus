const { Jimp } = require('jimp');

async function findHouseBounds() {
  const image = await Jimp.read('src/assets/overload_house_final.png');
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  
  let top = h;
  let bottom = 0;
  let left = w;
  let right = 0;
  
  // House colors: red roof, cream walls, brown doors, grey foundation
  // We look for pixels that are NOT green and NOT the grey border
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const hex = image.getPixelColor(x, y);
      const r = (hex >> 24) & 255;
      const g = (hex >> 16) & 255;
      const b = (hex >> 8) & 255;
      const a = hex & 255;
      
      if (a === 0) continue; // transparent
      
      // Is it green grass?
      const isGreen = g > r + 20 && g > b + 20;
      
      // Is it dark grey border? (104,109,118)
      const isDarkGrey = Math.abs(r - 105) < 15 && Math.abs(g - 110) < 15 && Math.abs(b - 119) < 15;
      
      if (!isGreen && !isDarkGrey) {
        if (y < top) top = y;
        if (y > bottom) bottom = y;
        if (x < left) left = x;
        if (x > right) right = x;
      }
    }
  }
  
  console.log(`House bounds: top=${top}, bottom=${bottom}, left=${left}, right=${right}`);
}

findHouseBounds();

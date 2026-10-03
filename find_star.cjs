const { Jimp } = require('jimp');

async function findStar() {
  const image = await Jimp.read('C:/Users/Admin/.gemini/antigravity-ide/brain/e9ef84e2-873e-4a74-864b-9cd07a960699/.user_uploaded/media_1790864516531.png');
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  
  for (let y = h/2; y < h - 2; y++) {
    for (let x = w/2; x < w - 2; x++) {
      const hex = image.getPixelColor(x, y);
      const r = (hex >> 24) & 255;
      const g = (hex >> 16) & 255;
      const b = (hex >> 8) & 255;
      
      if (r > 200 && g > 200 && b > 200) {
        // Check if it forms a star or small cluster
        // For example, if x,y is white, let's see how many white pixels are nearby
        let whiteCount = 0;
        for (let dy = -5; dy <= 5; dy++) {
          for (let dx = -5; dx <= 5; dx++) {
            const hex2 = image.getPixelColor(x+dx, y+dy);
            const r2 = (hex2 >> 24) & 255;
            const g2 = (hex2 >> 16) & 255;
            const b2 = (hex2 >> 8) & 255;
            if (r2 > 200 && g2 > 200 && b2 > 200) whiteCount++;
          }
        }
        
        // A window reflection is a straight line or large rectangle.
        // A star is a small cluster.
        if (whiteCount > 4 && whiteCount < 20) {
           console.log(`Potential star at x=${x}, y=${y}, whiteCount=${whiteCount}`);
        }
      }
    }
  }
}

findStar();

const { Jimp } = require('jimp');

async function processFather() {
  const image = await Jimp.read('src/assets/father_magenta.png');
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  
  // Create a copy for debugging mask
  const mask = image.clone();

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const r = image.bitmap.data[idx];
      const g = image.bitmap.data[idx+1];
      const b = image.bitmap.data[idx+2];
      const a = image.bitmap.data[idx+3];
      
      let isMagenta = false;
      let isGreenArtifact = false;
      
      // Distance to #FF00FF
      // Let's use Euclidean distance
      const distMagenta = Math.sqrt(Math.pow(r - 255, 2) + Math.pow(g - 0, 2) + Math.pow(b - 255, 2));
      if (distMagenta < 120) {
        isMagenta = true;
      }
      // Also thin pink-tinted edges: often they have high R and B, low G.
      if (r > 150 && b > 150 && g < 100) {
        isMagenta = true;
      }

      // Green speckles
      // "small scattered green/teal dot artifacts"
      if (g > r + 20 && g > 80) {
        isGreenArtifact = true;
      }
      
      if (isMagenta || isGreenArtifact) {
        image.bitmap.data[idx+3] = 0;
        
        // Mark on mask
        mask.bitmap.data[idx] = isGreenArtifact ? 0 : 255;
        mask.bitmap.data[idx+1] = isGreenArtifact ? 255 : 0;
        mask.bitmap.data[idx+2] = isGreenArtifact ? 0 : 255;
        mask.bitmap.data[idx+3] = 255;
      } else {
        // Mark on mask as black
        mask.bitmap.data[idx] = 0;
        mask.bitmap.data[idx+1] = 0;
        mask.bitmap.data[idx+2] = 0;
        mask.bitmap.data[idx+3] = 255;
      }
    }
  }

  await image.write('src/assets/father_cleaned.png');
  await mask.write('src/assets/father_mask.png');
  console.log("Saved cleaned image and mask");
}
processFather().catch(console.error);

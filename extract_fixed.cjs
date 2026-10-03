const { Jimp } = require('jimp');

async function extract() {
  const image = await Jimp.read('public/images/doctor_sprite.png');
  
  const directions = ['down', 'left', 'right', 'up'];
  
  for (let r = 0; r < 4; r++) {
    const clone = image.clone();
    
    // Crop center 128x192 of the first cell (c=0)
    const cropX = 0 * 256 + 64;
    const cropY = r * 256 + 32;
    const cropW = 128;
    const cropH = 192;
    
    clone.crop({x: cropX, y: cropY, w: cropW, h: cropH});
    
    clone.write(`public/images/doctor_${directions[r]}.png`);
  }
}
extract();

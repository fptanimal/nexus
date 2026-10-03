const { Jimp } = require('jimp');

async function checkEdgeColors() {
  const image = await Jimp.read('C:/Users/Admin/.gemini/antigravity-ide/brain/e9ef84e2-873e-4a74-864b-9cd07a960699/.user_uploaded/media_1790859582454.png');
  const w = image.bitmap.width;
  
  let colors = [];
  for (let x = 0; x < 10; x++) {
    const hex = image.getPixelColor(x, 0);
    const r = (hex >> 24) & 255;
    const g = (hex >> 16) & 255;
    const b = (hex >> 8) & 255;
    const a = hex & 255;
    colors.push(`[${x},0]: R:${r} G:${g} B:${b} A:${a}`);
  }
  
  console.log("Top left edge colors:");
  console.log(colors.join('\n'));
}

checkEdgeColors();

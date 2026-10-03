const { Jimp } = require('jimp');

async function checkShadow() {
  const image = await Jimp.read('src/assets/father_cleaned.png');
  
  // Look at the bottom of the first frame
  let yStart = 200;
  let colors = new Set();
  for (let y = 180; y < 229; y++) {
    for (let x = 60; x < 140; x++) {
      const idx = (y * image.bitmap.width + x) * 4;
      const r = image.bitmap.data[idx];
      const g = image.bitmap.data[idx+1];
      const b = image.bitmap.data[idx+2];
      const a = image.bitmap.data[idx+3];
      if (a > 0) {
        colors.add(`${r},${g},${b}`);
      }
    }
  }
  console.log("Colors near bottom of frame 0:");
  console.log(Array.from(colors).slice(0, 20));
}
checkShadow().catch(console.error);

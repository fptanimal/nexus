const { Jimp } = require('jimp');

async function checkShadow() {
  const image = await Jimp.read('src/assets/hero.png');
  // Just dump the unique colors in hero.png to see if there's a semi-transparent black or gray
  const colors = new Set();
  for (let y = 0; y < image.bitmap.height; y++) {
    for (let x = 0; x < image.bitmap.width; x++) {
      const idx = (y * image.bitmap.width + x) * 4;
      const r = image.bitmap.data[idx];
      const g = image.bitmap.data[idx+1];
      const b = image.bitmap.data[idx+2];
      const a = image.bitmap.data[idx+3];
      if (a > 0) {
        colors.add(`${r},${g},${b},${a}`);
      }
    }
  }
  console.log(`Unique colors in hero.png: ${colors.size}`);
  const colorArray = Array.from(colors);
  // See if there are dark grey/black transparent pixels
  const shadows = colorArray.filter(c => {
    const [r, g, b, a] = c.split(',').map(Number);
    return r < 100 && g < 100 && b < 100 && a < 255;
  });
  console.log("Shadow-like colors (semi-transparent dark):", shadows.slice(0, 10));
}
checkShadow().catch(console.error);

const { Jimp } = require('jimp');
async function run() {
  const img = await Jimp.read('public/player.png');
  console.log(img.bitmap.width, img.bitmap.height);
  let colors = new Set();
  for (let i = 0; i < img.bitmap.data.length; i+=4) {
    if (img.bitmap.data[i+3] > 0) {
      colors.add(`${img.bitmap.data[i]},${img.bitmap.data[i+1]},${img.bitmap.data[i+2]}`);
    }
  }
  console.log(Array.from(colors));
}
run();

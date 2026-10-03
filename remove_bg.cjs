const { Jimp } = require('jimp');

async function removeWhiteBg(input, output) {
  try {
    const image = await Jimp.read(input);
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      if (r > 230 && g > 230 && b > 230) {
        this.bitmap.data[idx + 3] = 0; // alpha
      }
    });
    await image.write(output);
    console.log(`Saved ${output}`);
  } catch (err) {
    console.error(`Error processing ${input}:`, err);
  }
}

(async () => {
  await removeWhiteBg('public/images/doctor_sprite.jpg', 'public/images/doctor_sprite.png');
  await removeWhiteBg('C:/Users/Admin/.gemini/antigravity-ide/brain/fe4b732a-db08-4757-b0f3-a2e7cb901fd0/doctor_8_direction_sprite_1787708358230.jpg', 'public/images/doctor_8dir.png');
})();

const { Jimp } = require('jimp');

async function processImages() {
  const files = [
    'player.png', 'player_down_walk1.png', 'player_down_walk2.png',
    'player_left.png', 'player_left_walk1.png', 'player_left_walk2.png',
    'player_right.png', 'player_right_walk1.png', 'player_right_walk2.png',
    'player_up.png', 'player_up_walk1.png', 'player_up_walk2.png'
  ];
  
  for (const file of files) {
    const img = await Jimp.read('public/' + file);
    img.scan(0, 0, img.bitmap.width, img.bitmap.height, function(x, y, idx) {
      const r = this.bitmap.data[idx];
      const g = this.bitmap.data[idx+1];
      const b = this.bitmap.data[idx+2];
      const a = this.bitmap.data[idx+3];
      
      if (a > 0) {
        // Check if color is dark gray (coat/hair)
        const avg = (r + g + b) / 3;
        const isGray = Math.abs(r - g) < 25 && Math.abs(r - b) < 25 && Math.abs(g - b) < 25;
        
        if (isGray && avg < 100) {
          // Map 0-100 to 180-255 to make it white/light gray
          const newV = Math.min(255, avg + 180);
          this.bitmap.data[idx] = newV;
          this.bitmap.data[idx+1] = newV;
          this.bitmap.data[idx+2] = newV;
        }
      }
    });
    
    // Write out as doctor_ai_down.png etc.
    let newName = file.replace('player', 'doctor_ai');
    if (file === 'player.png') newName = 'doctor_ai_down.png';
    await img.write('public/images/' + newName);
  }
}
processImages();

const { Jimp } = require('jimp');

async function createZoomedArtifacts() {
  const realImg = await Jimp.read('src/assets/teacher_final.png');
  const w = realImg.bitmap.width;
  const h = realImg.bitmap.height;
  
  const cellW = Math.floor(w / 6);
  const cellH = Math.floor(h / 4);
  
  // Create 4 zoomed images
  for (let r = 0; r < 4; r++) {
    const frame = realImg.clone().crop({ x: 0, y: r * cellH, w: cellW, h: cellH });
    
    // Zoom 6x
    const zoomed = new Jimp({ width: cellW * 6, height: cellH * 6 });
    for (let y = 0; y < cellH; y++) {
      for (let x = 0; x < cellW; x++) {
        const color = frame.getPixelColor(x, y);
        for (let zy = 0; zy < 6; zy++) {
          for (let zx = 0; zx < 6; zx++) {
            zoomed.setPixelColor(color, x * 6 + zx, y * 6 + zy);
          }
        }
      }
    }
    
    const dir = r === 0 ? 'down' : r === 1 ? 'left' : r === 2 ? 'right' : 'up';
    await zoomed.write(`C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\a51ce1d0-4845-4752-aa34-a2ba44c0ce06\\teacher_zoom_${dir}.png`);
  }
  console.log("Zoomed artifacts created.");
}

createZoomedArtifacts().catch(console.error);

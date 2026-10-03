const { Jimp } = require('jimp');

async function findRows() {
  const image = await Jimp.read('src/assets/teacher_peach.png');
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  
  // Find background color from top-left pixel
  const bgR = image.bitmap.data[0];
  const bgG = image.bitmap.data[1];
  const bgB = image.bitmap.data[2];
  
  function isBg(x, y) {
    const idx = (y * w + x) * 4;
    const r = image.bitmap.data[idx];
    const g = image.bitmap.data[idx+1];
    const b = image.bitmap.data[idx+2];
    return Math.abs(r-bgR) < 20 && Math.abs(g-bgG) < 20 && Math.abs(b-bgB) < 20;
  }
  
  const rowBounds = [];
  let inRow = false;
  let startY = 0;
  
  for (let y = 0; y < h; y++) {
    let empty = true;
    for (let x = 0; x < w; x++) {
      if (!isBg(x, y)) {
        empty = false;
        break;
      }
    }
    
    if (!empty && !inRow) {
      inRow = true;
      startY = y;
    } else if (empty && inRow) {
      inRow = false;
      rowBounds.push({ startY, endY: y - 1 });
    }
  }
  if (inRow) rowBounds.push({ startY, endY: h - 1 });
  
  console.log("Found " + rowBounds.length + " rows.");
  rowBounds.forEach((b, i) => console.log(`Row ${i+1}: Y=${b.startY} to ${b.endY}, Height=${b.endY - b.startY + 1}`));
}
findRows().catch(console.error);

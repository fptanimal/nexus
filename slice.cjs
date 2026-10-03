const { Jimp } = require('jimp');

async function slice() {
  const image = await Jimp.read('public/images/doctor_sprite.png');
  const w = image.bitmap.width;
  const h = image.bitmap.height;

  // Find non-transparent bounding boxes for the 4 rows and 4 cols
  let colBounds = [];
  let rowBounds = [];
  
  // Find rows
  let inRow = false;
  let rowStart = 0;
  for (let y = 0; y < h; y++) {
    let hasPixel = false;
    for (let x = 0; x < w; x++) {
      if (image.bitmap.data[(y * w + x) * 4 + 3] > 0) {
        hasPixel = true; break;
      }
    }
    if (hasPixel && !inRow) { inRow = true; rowStart = y; }
    else if (!hasPixel && inRow) { inRow = false; rowBounds.push({start: rowStart, end: y}); }
  }
  if (inRow) rowBounds.push({start: rowStart, end: h});

  // Find columns
  let inCol = false;
  let colStart = 0;
  for (let x = 0; x < w; x++) {
    let hasPixel = false;
    for (let y = 0; y < h; y++) {
      if (image.bitmap.data[(y * w + x) * 4 + 3] > 0) {
        hasPixel = true; break;
      }
    }
    if (hasPixel && !inCol) { inCol = true; colStart = x; }
    else if (!hasPixel && inCol) { inCol = false; colBounds.push({start: colStart, end: x}); }
  }
  if (inCol) colBounds.push({start: colStart, end: w});

  console.log('Rows:', rowBounds);
  console.log('Cols:', colBounds);
}
slice();

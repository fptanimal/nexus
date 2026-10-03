const { Jimp } = require('jimp');

async function processTeacher() {
  const image = await Jimp.read('src/assets/teacher_peach.png');
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  
  const bgR = image.bitmap.data[0];
  const bgG = image.bitmap.data[1];
  const bgB = image.bitmap.data[2];
  
  const tolerance = 20;
  
  function isMatch(idx) {
    const r = image.bitmap.data[idx];
    const g = image.bitmap.data[idx+1];
    const b = image.bitmap.data[idx+2];
    const a = image.bitmap.data[idx+3];
    if (a === 0) return false;
    return Math.abs(r - bgR) <= tolerance && 
           Math.abs(g - bgG) <= tolerance && 
           Math.abs(b - bgB) <= tolerance;
  }
  
  const stack = [];
  // Push all border pixels
  for (let x = 0; x < w; x++) {
    stack.push({x, y: 0});
    stack.push({x, y: h-1});
  }
  for (let y = 0; y < h; y++) {
    stack.push({x: 0, y});
    stack.push({x: w-1, y});
  }
  
  while (stack.length > 0) {
    const {x, y} = stack.pop();
    const idx = (y * w + x) * 4;
    
    if (isMatch(idx)) {
      image.bitmap.data[idx+3] = 0; // make transparent
      
      if (x > 0) stack.push({x: x-1, y: y});
      if (x < w-1) stack.push({x: x+1, y: y});
      if (y > 0) stack.push({x: x, y: y-1});
      if (y < h-1) stack.push({x: x, y: y+1});
    }
  }
  
  await image.write('C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\a51ce1d0-4845-4752-aa34-a2ba44c0ce06\\teacher_bg_removed.png');
  console.log("Flood fill completed from all borders.");
}

processTeacher().catch(console.error);

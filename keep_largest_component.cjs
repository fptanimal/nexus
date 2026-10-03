const { Jimp } = require('jimp');

async function isolateHouse() {
  const image = await Jimp.read('src/assets/overload_house_final.png');
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  
  // 1. Create a boolean map of non-transparent pixels
  const isOpaque = Array(h).fill(0).map(() => Array(w).fill(false));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const hex = image.getPixelColor(x, y);
      if ((hex & 255) > 0) {
        isOpaque[y][x] = true;
      }
    }
  }
  
  // 2. Find components
  const visited = Array(h).fill(0).map(() => Array(w).fill(false));
  const components = [];
  
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (isOpaque[y][x] && !visited[y][x]) {
        // BFS to find all pixels in this component
        const comp = [];
        const queue = [{x, y}];
        visited[y][x] = true;
        
        let head = 0;
        while (head < queue.length) {
          const curr = queue[head++];
          comp.push(curr);
          
          // Check 4 neighbors
          const dirs = [[0,1], [1,0], [0,-1], [-1,0], [1,1], [1,-1], [-1,1], [-1,-1]];
          for (const d of dirs) {
            const nx = curr.x + d[0];
            const ny = curr.y + d[1];
            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
              if (isOpaque[ny][nx] && !visited[ny][nx]) {
                visited[ny][nx] = true;
                queue.push({x: nx, y: ny});
              }
            }
          }
        }
        components.push(comp);
      }
    }
  }
  
  console.log(`Found ${components.length} components.`);
  
  // 3. Find largest component
  components.sort((a, b) => b.length - a.length);
  console.log(`Largest component has ${components[0].length} pixels.`);
  if (components.length > 1) {
    console.log(`Second largest has ${components[1].length} pixels.`);
  }
  
  // 4. Create a set of pixels in the largest component
  const largestSet = new Set();
  for (const p of components[0]) {
    largestSet.add(`${p.x},${p.y}`);
  }
  
  // 5. Clear all other pixels
  let cleared = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (isOpaque[y][x] && !largestSet.has(`${x},${y}`)) {
        image.setPixelColor(0x00000000, x, y);
        cleared++;
      }
    }
  }
  
  console.log(`Cleared ${cleared} artifact pixels.`);
  
  await image.write('src/assets/overload_house_final.png');
  console.log('Saved cleaned image to overload_house_final.png');
}

isolateHouse().catch(console.error);

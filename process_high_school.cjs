const { Jimp, intToRGBA, rgbaToInt } = require('jimp');

async function processHighSchool() {
    const inputPath = 'C:/Users/Admin/.gemini/antigravity-ide/brain/e9ef84e2-873e-4a74-864b-9cd07a960699/.user_uploaded/media_1790864516531.png';
    const outputPath = 'C:/Users/Admin/Downloads/overload-game/src/assets/high_school_building.png';
    
    console.log("Loading image...");
    const image = await Jimp.read(inputPath);
    const w = image.bitmap.width;
    const h = image.bitmap.height;
    
    // 1. Watermark removal (cloning)
    let clonedPixels = 0;
    // Lower-right window area: x > w - 100 (406), y > h - 100 (391)
    // Looking at the output earlier, the window reflection might be caught.
    // The user said "small white sparkle/star watermark".
    for (let y = h - 150; y < h - 30; y++) {
        for (let x = w - 100; x < w - 10; x++) {
            const hex = image.getPixelColor(x, y);
            const { r, g, b } = intToRGBA(hex);
            if (r > 200 && g > 200 && b > 200) {
                // Clone from 15 pixels to the left
                const cloneHex = image.getPixelColor(x - 20, y);
                image.setPixelColor(cloneHex, x, y);
                clonedPixels++;
            }
        }
    }
    console.log(`Cloned ${clonedPixels} pixels for watermark.`);

    // 2. Magenta and pink edge removal
    let removedMagenta = 0;
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const hex = image.getPixelColor(x, y);
            const { r, g, b, a } = intToRGBA(hex);
            if (a === 0) continue;

            const distToMagenta = Math.abs(r - 255) + Math.abs(g - 0) + Math.abs(b - 255);
            if (distToMagenta < 80) {
                image.setPixelColor(0x00000000, x, y);
                removedMagenta++;
                continue;
            }

            if (r > g + 30 && b > g + 30) {
                image.setPixelColor(0x00000000, x, y);
                removedMagenta++;
                continue;
            }
        }
    }
    console.log(`Removed ${removedMagenta} magenta/pink pixels.`);

    // 3. Keep only largest connected component to clear map artifacts
    const isOpaque = Array(h).fill(0).map(() => Array(w).fill(false));
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if ((image.getPixelColor(x, y) & 255) > 0) {
          isOpaque[y][x] = true;
        }
      }
    }
    
    const visited = Array(h).fill(0).map(() => Array(w).fill(false));
    const components = [];
    
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (isOpaque[y][x] && !visited[y][x]) {
          const comp = [];
          const queue = [{x, y}];
          visited[y][x] = true;
          
          let head = 0;
          while (head < queue.length) {
            const curr = queue[head++];
            comp.push(curr);
            
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
    
    components.sort((a, b) => b.length - a.length);
    console.log(`Largest component has ${components[0].length} pixels.`);
    
    const largestSet = new Set();
    for (const p of components[0]) {
      largestSet.add(`${p.x},${p.y}`);
    }
    
    let cleared = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (isOpaque[y][x] && !largestSet.has(`${x},${y}`)) {
          image.setPixelColor(0x00000000, x, y);
          cleared++;
        }
      }
    }
    console.log(`Cleared ${cleared} disconnected artifact pixels.`);

    await image.write(outputPath);
    console.log('Saved processed image to ' + outputPath);
}

processHighSchool().catch(console.error);

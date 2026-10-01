const { Jimp, intToRGBA, rgbaToInt } = require('jimp');

async function processImage() {
    const inputPath = 'C:/Users/Admin/.gemini/antigravity-ide/brain/ca892962-9ab1-4daf-8796-5664cc73e1ba/.user_uploaded/media_1790820226516.png';
    const outputPath = 'C:/Users/Admin/Downloads/overload-game/src/assets/overload_house.png';
    
    console.log("Loading image...");
    const image = await Jimp.read(inputPath);
    const w = image.bitmap.width;
    const h = image.bitmap.height;
    console.log(`Loaded image: ${w}x${h}`);

    let watermarkPixels = 0;
    for (let y = Math.floor(h * 0.7); y < h; y++) {
        for (let x = Math.floor(w * 0.7); x < w; x++) {
            const hex = image.getPixelColor(x, y);
            const { r, g, b, a } = intToRGBA(hex);
            if (r > 240 && g > 240 && b > 240) {
                let cloneX = x - 10;
                if (cloneX >= 0) {
                    const cloneColor = image.getPixelColor(cloneX, y);
                    image.setPixelColor(cloneColor, x, y);
                    watermarkPixels++;
                }
            }
        }
    }
    console.log(`Replaced ${watermarkPixels} watermark pixels.`);

    let removed = 0;
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const hex = image.getPixelColor(x, y);
            const { r, g, b, a } = intToRGBA(hex);
            
            const dist = Math.abs(r - 255) + Math.abs(g - 0) + Math.abs(b - 255);
            
            if (dist < 80 || (r > 120 && b > 120 && g < r - 40 && g < b - 40)) {
                image.setPixelColor(rgbaToInt(0, 0, 0, 0), x, y);
                removed++;
            }
        }
    }
    console.log(`Removed ${removed} background pixels.`);

    await image.write(outputPath);
    console.log('Saved processed image to ' + outputPath);

    // Measure house bounds
    let minX = w, maxX = 0, minY = h, maxY = 0;
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const hex = image.getPixelColor(x, y);
            const { a } = intToRGBA(hex);
            if (a > 0) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    }
    console.log(`House bounds: X=${minX}-${maxX}, Y=${minY}-${maxY}, W=${maxX-minX+1}, H=${maxY-minY+1}`);

    // Detect door
    // Look for brown pixels at the bottom center
    let doorMinX = w, doorMaxX = 0, doorMinY = h, doorMaxY = 0;
    for (let y = Math.floor(h/2); y < h; y++) {
        for (let x = Math.floor(w * 0.3); x < Math.floor(w * 0.7); x++) {
            const hex = image.getPixelColor(x, y);
            const { r, g, b, a } = intToRGBA(hex);
            // Dark brown door color detection
            if (a > 0 && r < 100 && g < 80 && b < 60 && r > 20) {
                if (x < doorMinX) doorMinX = x;
                if (x > doorMaxX) doorMaxX = x;
                if (y < doorMinY) doorMinY = y;
                if (y > doorMaxY) doorMaxY = y;
            }
        }
    }
    console.log(`Door roughly at: X=${doorMinX}-${doorMaxX}, Y=${doorMinY}-${doorMaxY}`);
}

processImage().catch(console.error);

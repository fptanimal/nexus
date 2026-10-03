const { Jimp, intToRGBA, rgbaToInt, colorDiff } = require('jimp');

async function processImage() {
    const inputPath = 'C:/Users/Admin/.gemini/antigravity-ide/brain/e9ef84e2-873e-4a74-864b-9cd07a960699/.user_uploaded/media_1790859582454.png';
    const outputPath = 'C:/Users/Admin/Downloads/overload-game/src/assets/overload_house_final.png';
    
    console.log("Loading image...");
    const image = await Jimp.read(inputPath);
    const w = image.bitmap.width;
    const h = image.bitmap.height;
    console.log(`Loaded image: ${w}x${h}`);

    let removedMagenta = 0;
    let removedPinkEdge = 0;
    let removedWatermark = 0;

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const hex = image.getPixelColor(x, y);
            const { r, g, b, a } = intToRGBA(hex);
            
            if (a === 0) continue;

            // Remove watermark in top-right corner
            // "small white sparkle/star watermark artifact in the top-right corner"
            if (x > w - 100 && y < 100) {
                // Remove the white/grey sparkle (r, g, b all high)
                if (r > 150 && g > 150 && b > 150) {
                    image.setPixelColor(rgbaToInt(0, 0, 0, 0), x, y);
                    removedWatermark++;
                    continue;
                }
                // Also remove if it is magenta or pink-tinted, handled below
            }

            // Remove pixels close to #FF00FF (color distance ~60)
            const distToMagenta = Math.abs(r - 255) + Math.abs(g - 0) + Math.abs(b - 255);
            if (distToMagenta < 80) {
                image.setPixelColor(rgbaToInt(0, 0, 0, 0), x, y);
                removedMagenta++;
                continue;
            }

            // Remove thin pink-tinted edge pixels (red & blue clearly higher than green)
            if (r > g + 30 && b > g + 30) {
                image.setPixelColor(rgbaToInt(0, 0, 0, 0), x, y);
                removedPinkEdge++;
                continue;
            }
        }
    }
    
    console.log(`Removed ${removedMagenta} magenta pixels.`);
    console.log(`Removed ${removedPinkEdge} pink edge pixels.`);
    console.log(`Removed ${removedWatermark} watermark/top-right pixels.`);

    await image.write(outputPath);
    console.log('Saved processed image to ' + outputPath);
}

processImage().catch(console.error);

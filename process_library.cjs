const { Jimp } = require('jimp');
const fs = require('fs');

async function main() {
    const sourcePath = 'C:\\Users\\Admin\\Downloads\\Gemini_Generated_Image_nlj5d7nlj5d7nlj5.png';
    const magentaPath = 'C:\\Users\\Admin\\Downloads\\overload-game\\src\\assets\\library_magenta.png';
    const finalPath = 'C:\\Users\\Admin\\Downloads\\overload-game\\src\\assets\\library_final.png';

    fs.copyFileSync(sourcePath, magentaPath);
    console.log(`Copied to ${magentaPath}`);

    const image = await Jimp.read(magentaPath);
    
    let removedCount = 0;
    
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
        const r = this.bitmap.data[idx + 0];
        const g = this.bitmap.data[idx + 1];
        const b = this.bitmap.data[idx + 2];
        const a = this.bitmap.data[idx + 3];

        if (a === 0) return;

        let isMagenta = false;
        
        // 1. Color distance to #FF00FF
        const dist = Math.sqrt(Math.pow(r - 255, 2) + Math.pow(g - 0, 2) + Math.pow(b - 255, 2));
        if (dist <= 60) {
            isMagenta = true;
        }
        // 2. Pink-tinted fringe
        else if (r > g + 40 && b > g + 40 && r > 120 && b > 120) {
            isMagenta = true;
        }

        if (isMagenta) {
            this.bitmap.data[idx + 3] = 0; // Alpha = 0
            removedCount++;
        }
    });

    await image.write(finalPath);
    console.log(`Removed ${removedCount} pixels. Saved to ${finalPath}`);
}

main().catch(console.error);

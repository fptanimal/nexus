const { Jimp } = require('jimp');

async function analyze() {
    const image = await Jimp.read('src/assets/overload_house.png');
    const w = image.bitmap.width;
    const h = image.bitmap.height;
    
    // Find the actual bottom of the house
    let bottom = h - 1;
    outer: while(bottom >= 0) {
        for(let x=0; x<w; x++) {
            const a = image.bitmap.data[(bottom * w + x) * 4 + 3];
            if(a > 0) break outer;
        }
        bottom--;
    }
    
    // Print the bottom 5 rows of colors in the middle of the house
    const midX = Math.floor(w / 2);
    for(let y=bottom-15; y<=bottom; y++) {
        const r = image.bitmap.data[(y * w + midX) * 4];
        const g = image.bitmap.data[(y * w + midX) * 4 + 1];
        const b = image.bitmap.data[(y * w + midX) * 4 + 2];
        console.log(`y=${y}: rgb(${r},${g},${b})`);
    }
}

analyze().catch(console.error);

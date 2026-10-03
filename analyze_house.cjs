const Jimp = require('jimp');

async function removeBorder() {
    const img = await Jimp.read('src/assets/overload_house.png');
    const width = img.getWidth();
    const height = img.getHeight();
    
    console.log(`Image size: ${width}x${height}`);
    
    const colors = {};
    for(let y=0; y<height; y++) {
        for(let x=0; x<width; x++) {
            const hex = img.getPixelColor(x, y);
            const rgba = Jimp.intToRGBA(hex);
            if(rgba.a > 0) {
                const key = `${rgba.r},${rgba.g},${rgba.b}`;
                colors[key] = (colors[key] || 0) + 1;
            }
        }
    }
    
    const sortedColors = Object.entries(colors).sort((a,b) => b[1] - a[1]);
    console.log('Top colors:', sortedColors.slice(0, 15));
}

removeBorder().catch(console.error);

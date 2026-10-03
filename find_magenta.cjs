const fs = require('fs');
const Jimp = require('jimp');

const files = [
    "C:\\Users\\Admin\\Downloads\\Gemini_Generated_Image_sd0oewsd0oewsd0o.png",
    "C:\\Users\\Admin\\Downloads\\Gemini_Generated_Image_rdppmcrdppmcrdpp.png",
    "C:\\Users\\Admin\\Downloads\\Gemini_Generated_Image_6o4c5u6o4c5u6o4c.png",
    "C:\\Users\\Admin\\Downloads\\Gemini_Generated_Image_laaea3laaea3laae.png",
    "C:\\Users\\Admin\\Downloads\\Gemini_Generated_Image_yauk7xyauk7xyauk.png",
    "C:\\Users\\Admin\\Downloads\\Gemini_Generated_Image_ynwaknynwaknynwa.png",
    "C:\\Users\\Admin\\Downloads\\Gemini_Generated_Image_z31xy6z31xy6z31x.png",
    "C:\\Users\\Admin\\Downloads\\e4fbb243-df4a-4ba2-abcf-eb4fb181968c.png",
    "C:\\Users\\Admin\\Downloads\\99f99220-8b9e-4a55-81a0-d1e59efb8853.png",
    "C:\\Users\\Admin\\Downloads\\ChatGPT Image Sep 24, 2026, 11_32_35 AM.png"
];

async function checkFiles() {
    for (const file of files) {
        if (!fs.existsSync(file)) continue;
        try {
            const image = await Jimp.read(file);
            const hex = image.getPixelColor(0, 0); // top-left pixel
            const { r, g, b, a } = Jimp.intToRGBA(hex);
            console.log(`${file}: rgba(${r}, ${g}, ${b}, ${a})`);
            // Check if magenta (r > 200, g < 50, b > 200)
            if (r > 200 && g < 50 && b > 200) {
                console.log(`FOUND MAGENTA BACKGROUND: ${file}`);
            }
        } catch (e) {
            console.log(`Error reading ${file}: ${e.message}`);
        }
    }
}
checkFiles();

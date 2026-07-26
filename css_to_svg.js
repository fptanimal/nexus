import fs from 'fs';

const items = ['bed', 'plant', 'desk', 'laptop'];

for (const item of items) {
  const txtPath = `./${item}.txt`;
  const svgPath = `./public/${item}.svg`;
  
  if (!fs.existsSync(txtPath)) continue;

  const inputTxt = fs.readFileSync(txtPath, 'utf-8');
  const match = inputTxt.match(/box-shadow:\s*([^;"]+)/);

  if (!match) {
    console.log(`No box-shadow found for ${item}. Skipping...`);
    continue;
  }

  const shadows = match[1].split(',');
  let svgRects = '';
  let maxX = 0;
  let maxY = 0;

  for (const shadow of shadows) {
    const parts = shadow.trim().split(/\s+/);
    if (parts.length < 3) continue;
    
    let color = parts[0];
    let xStr = parts[1];
    let yStr = parts[2];
    
    if (!color.startsWith('#') && !color.startsWith('rgb') && !color.startsWith('rgba') && !['black', 'white', 'silver', 'transparent'].includes(color)) {
      xStr = parts[0];
      yStr = parts[1];
      color = parts[2] || parts[3]; 
    }
    
    const x = parseInt(xStr.replace('px', '')) || 0;
    const y = parseInt(yStr.replace('px', '')) || 0;
    
    if (color.toLowerCase() === '#fff' || color.toLowerCase() === 'white' || color.toLowerCase() === '#ffffff') {
      continue;
    }
    
    if (y > 153) {
      continue;
    }
    
    if (item === 'desk') {
       // Filter red/pink wallpaper
       let skip = false;
       if (color.startsWith('#')) {
         let hex = color.slice(1);
         if (hex.length === 3) hex = hex.split('').map(c => c+c).join('');
         const r = parseInt(hex.slice(0,2), 16);
         const g = parseInt(hex.slice(2,4), 16);
         const b = parseInt(hex.slice(4,6), 16);
         
         // Red wallpaper (~189, 106, 98)
         if (r >= 160 && r <= 200 && g >= 90 && g <= 120 && b >= 80 && b <= 110) {
            skip = true;
         }
         // Yellow stripes (~219, 152, 75)
         if (r >= 200 && r <= 230 && g >= 140 && g <= 170 && b >= 60 && b <= 90) {
            skip = true;
         }
         // Also filter the very light yellow stripes if any (maybe ~225, 180, 100)
         if (r >= 210 && r <= 240 && g >= 160 && g <= 190 && b >= 70 && b <= 100) {
            skip = true;
         }
       }
       if (skip) continue;
    }
    
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
    
    if (color !== 'transparent') {
      svgRects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${color}" />\n`;
    }
  }

  const width = maxX + 1;
  const height = maxY + 1;

  if (width > 1 && height > 1) {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n${svgRects}\n</svg>`;
    fs.writeFileSync(svgPath, svgContent);
    console.log(`SVG generated at ${svgPath}, width: ${width} height: ${height}`);
  }
}

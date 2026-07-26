import fs from 'fs';

const inputTxt = fs.readFileSync('./desk.txt', 'utf-8');
const match = inputTxt.match(/box-shadow:\s*([^;"]+)/);

if (!match) {
  console.log("No box-shadow found!");
  process.exit(1);
}

const shadows = match[1].split(',');
const colorCount = {};

for (const shadow of shadows) {
  const parts = shadow.trim().split(/\s+/);
  if (parts.length < 3) continue;
  
  let color = parts[0];
  if (!color.startsWith('#') && !color.startsWith('rgb') && !color.startsWith('rgba') && !['black', 'white', 'silver', 'transparent'].includes(color)) {
    color = parts[2] || parts[3]; 
  }
  
  color = color.toLowerCase();
  colorCount[color] = (colorCount[color] || 0) + 1;
}

const sortedColors = Object.entries(colorCount).sort((a, b) => b[1] - a[1]);
console.log("Top 15 colors:");
for (let i = 0; i < 15; i++) {
  console.log(sortedColors[i]);
}

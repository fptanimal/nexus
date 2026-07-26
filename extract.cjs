const fs = require('fs');
const content = fs.readFileSync('image-css.txt', 'utf8');
const start = content.indexOf('style="') + 7;
const end = content.lastIndexOf('"');
const style = content.substring(start, end);
fs.writeFileSync('src/assets/CustomImage.css', '.custom-css-image { ' + style + ' }');
console.log('Done');

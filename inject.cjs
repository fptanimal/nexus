const fs = require('fs');
const path = 'C:\\\\Users\\\\Admin\\\\Downloads\\\\NEXXUS\\\\overload-game\\\\src\\\\components\\\\GameCanvas.jsx';
let code = fs.readFileSync(path, 'utf8');

const newSprites = fs.readFileSync('C:\\\\Users\\\\Admin\\\\Downloads\\\\NEXXUS\\\\overload-game\\\\new_sprites.txt', 'utf8');
const inner = newSprites.replace('const SPRITES = {\\n', '').replace('};\\n', '').trim();

// The regex matches everything from playerDown to the end of playerUpWalk2
const regex = /playerDown: \[[\\s\\S]*?playerUpWalk2: \[[\\s\\S]*?  \],/g;
code = code.replace(regex, inner);

fs.writeFileSync(path, code);
console.log('Injected successfully');

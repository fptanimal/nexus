const fs = require('fs');
const path = 'C:\\\\Users\\\\Admin\\\\Downloads\\\\NEXXUS\\\\overload-game\\\\src\\\\components\\\\GameCanvas.jsx';
let code = fs.readFileSync(path, 'utf8');

const bed = [
  "BxxxxxxxxxxxxxxB",
  "pwMMMMMMMMMMMMwp",
  "pwMMMMMMMMMMMMwp",
  "pwMMMMMMMMMMMMwp",
  "pwQQQQQQQQQQQQwp",
  "pwQQQQQQQQQQQQwp",
  "pwQQQQQQQQQQQQwp",
  "pwQQQQQQQQQQQQwp",
  "pwQQQQQQQQQQQQwp",
  "pwQQQQQQQQQQQQwp",
  "pwQQQQQQQQQQQQwp",
  "pwQQQQQQQQQQQQwp",
  "pwQQQQQQQQQQQQwp",
  "pwQQQQQQQQQQQQwp",
  "pwwwwwwwwwwwwwwp",
  "pppppppppppppppp"
];

const colorMapAddition = `
  '6': '#d98880', // pinkish bed sheet
  '7': '#f5b7b1', // light pink pillow
  '8': '#a93226', // dark red blanket shadow
  '9': '#7e5109', // darker wood
  'a': '#27ae60', // plant green
  'g': '#85c1e9', // window glass
`;

// we will do this manually for now

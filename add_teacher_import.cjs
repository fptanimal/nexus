const fs = require('fs');
let c = fs.readFileSync('src/components/GameCanvas.jsx', 'utf8');

c = c.replace("import motherSpritesheetUrl from '../assets/mother_final.png';", "import motherSpritesheetUrl from '../assets/mother_final.png';\nimport teacherSpritesheetUrl from '../assets/teacher_final.png';");
c = c.replace("window.__motherSpritesheetSrc = motherSpritesheetUrl;", "window.__motherSpritesheetSrc = motherSpritesheetUrl;\nwindow.__teacherSpritesheetSrc = teacherSpritesheetUrl;");

fs.writeFileSync('src/components/GameCanvas.jsx', c);
console.log("Imports added");

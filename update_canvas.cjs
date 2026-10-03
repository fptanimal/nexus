const fs = require('fs');
let c = fs.readFileSync('src/components/GameCanvas.jsx', 'utf8');

c = c.replace(/if \(npc\.spriteSheet === 'father'\) frameCount = 6;/g, "if (npc.spriteSheet === 'father' || npc.spriteSheet === 'teacher') frameCount = 6;");
c = c.replace(/if \(pos\.spriteSheet === 'father'\) frameCount = 6;/g, "if (pos.spriteSheet === 'father' || pos.spriteSheet === 'teacher') frameCount = 6;");

// Also add teacher load logic right after mother
const motherLoadStr = "window.customPlayerSprites['father'] = fatherImg;";
const teacherLoadStr = `window.customPlayerSprites['father'] = fatherImg;

            // Load teacher spritesheet
            const teacherImg = new Image();
            teacherImg.src = window.__teacherSpritesheetSrc;
            window.customPlayerSprites['teacher'] = teacherImg;`;

c = c.replace(motherLoadStr, teacherLoadStr);

fs.writeFileSync('src/components/GameCanvas.jsx', c);
console.log("GameCanvas updated");

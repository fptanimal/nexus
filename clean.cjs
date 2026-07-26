const fs = require('fs');
let c = fs.readFileSync('public/school.txt', 'utf-8');
c = c.replace(/#fff\s+-?\d+(?:px)?\s+-?\d+(?:px)?\s*,?/gi, '');
c = c.replace(/,\s*(?=">)|,\s*$/g, '');
fs.writeFileSync('public/school.txt', c, 'utf-8');

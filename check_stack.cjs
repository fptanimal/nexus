const fs = require('fs');
const code = fs.readFileSync('src/components/GameCanvas.jsx', 'utf8');
const stack = [];
const lines = code.split('\n');
let inString = false;
let stringChar = '';

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Skip comments simplified
  const commentIdx = line.indexOf('//');
  const codeLine = commentIdx !== -1 ? line.substring(0, commentIdx) : line;

  for (let j = 0; j < codeLine.length; j++) {
    const c = codeLine[j];
    if (inString) {
      if (c === stringChar && codeLine[j-1] !== '\\\\') inString = false;
    } else {
      if (c === "'" || c === '"' || c === "`") { inString = true; stringChar = c; }
      else if (c === '{' || c === '[' || c === '(') stack.push({c, line: i+1});
      else if (c === '}' || c === ']' || c === ')') {
        if (stack.length > 0) {
           const top = stack.pop();
           const expected = c === '}' ? '{' : c === ']' ? '[' : '(';
           if (top.c !== expected) {
              console.log('Mismatch at line ' + (i+1) + ': found ' + c + ' but top was ' + top.c + ' from line ' + top.line);
           }
        } else {
           console.log('Mismatch at line ' + (i+1) + ': found ' + c + ' but stack is empty');
        }
      }
    }
  }
}

console.log('Stack at end of file:');
for(let item of stack) {
  console.log(item.c + ' from line ' + item.line);
}

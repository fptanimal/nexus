const fs = require('fs');
const code = fs.readFileSync('src/components/GameCanvas.jsx', 'utf8');
const stack = [];
const lines = code.split('\n');
let inString = false;
let stringChar = '';
for (let i = 685; i < 2592; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    const c = line[j];
    const nextC = line[j+1];
    
    // Ignore block comments (simplified)
    if (c === '/' && nextC === '/') break;
    
    if (inString) {
      if (c === stringChar && line[j-1] !== '\\\\') inString = false;
    } else {
      if (c === "'" || c === '"' || c === "`") { inString = true; stringChar = c; }
      else if (c === '{' || c === '[' || c === '(') stack.push({c, line: i+1});
      else if (c === '}' || c === ']' || c === ')') {
        if (stack.length === 0) {
          console.log('Mismatch at line ' + (i+1) + ': found ' + c + ' but stack is empty');
          process.exit(1);
        }
        const top = stack.pop();
        const expected = c === '}' ? '{' : c === ']' ? '[' : '(';
        if (top.c !== expected) {
          console.log('Mismatch at line ' + (i+1) + ': found ' + c + ' but expected to close ' + top.c + ' from line ' + top.line);
          process.exit(1);
        }
      }
    }
  }
}
console.log('Stack size at end: ' + stack.length);
if (stack.length > 0) {
  for (let i = Math.max(0, stack.length - 5); i < stack.length; i++) {
    console.log('Unclosed: ' + stack[i].c + ' at line ' + stack[i].line);
  }
}

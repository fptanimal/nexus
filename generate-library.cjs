const fs = require('fs');
const content = fs.readFileSync('library-css.txt', 'utf8');
const html = content.replace(/^[\s\S]*?<div/i, '<div');
const component = `import React from 'react';

export default function LibraryBuilding() {
  return (
    <div 
      className="absolute bottom-0 left-0 origin-bottom-left"
      style={{ transform: 'scale(1)', zIndex: 10 }}
      dangerouslySetInnerHTML={{ __html: \`${html.replace(/`/g, '\\`')}\` }}
    />
  );
}
`;
fs.writeFileSync('src/components/LibraryBuilding.jsx', component);
console.log('LibraryBuilding.jsx generated successfully.');

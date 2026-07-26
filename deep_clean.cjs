const fs = require('fs');
let c = fs.readFileSync('public/school.txt', 'utf8');

c = c.replace(/#([0-9a-fA-F]{6})\s+-?\d+(?:px)?\s+-?\d+(?:px)?\s*,?/g, (match, hex) => {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    // Nếu màu gần giống màu trắng (cả 3 kênh đều > 245)
    if (r > 245 && g > 245 && b > 245) {
        return ''; // Xoá pixel này
    }
    return match;
});

// Xử lý cả dạng màu 3 ký tự (vd #fff)
c = c.replace(/#([0-9a-fA-F]{3})\s+-?\d+(?:px)?\s+-?\d+(?:px)?\s*,?/g, (match, hex) => {
    const r = parseInt(hex[0]+hex[0], 16);
    const g = parseInt(hex[1]+hex[1], 16);
    const b = parseInt(hex[2]+hex[2], 16);
    if (r > 245 && g > 245 && b > 245) {
        return '';
    }
    return match;
});

// Dọn dẹp dấu phẩy thừa
c = c.replace(/,\s*(?=">)|,\s*$/g, '');

fs.writeFileSync('public/school.txt', c, 'utf8');
console.log('Cleaned almost-white pixels');

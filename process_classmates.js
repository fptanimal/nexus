import fs from 'fs';
import { PNG } from 'pngjs';
import path from 'path';

const basePath = 'C:/Users/Admin/Downloads/overload-game/src/assets';

function processImage(inputFile, outputFile, config) {
    const data = fs.readFileSync(inputFile);
    const png = PNG.sync.read(data);
    const { width, height } = png;
    
    // Background removal
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (width * y + x) << 2;
            const r = png.data[idx];
            const g = png.data[idx+1];
            const b = png.data[idx+2];
            
            // The characters only have white, black, dark grey, peach skin, brown hair.
            // Any pixel with significant red AND blue (magenta/purple) is background or shadow.
            if (r > g + 20 && b > g + 20) {
                png.data[idx+3] = 0;
            }
        }
    }

    const activeY = new Array(height).fill(false);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (png.data[(width * y + x) * 4 + 3] > 0) {
                activeY[y] = true;
                break;
            }
        }
    }

    let rowsList = [];
    let inRow = false;
    let startY = 0;
    for (let y = 0; y < height; y++) {
        if (activeY[y] && !inRow) {
            inRow = true;
            startY = y;
        } else if (!activeY[y] && inRow) {
            inRow = false;
            rowsList.push({ start: startY, end: y - 1 });
        }
    }
    if (inRow) rowsList.push({ start: startY, end: height - 1 });

    rowsList = rowsList.filter(r => (r.end - r.start) > 10);
    
    if (rowsList.length < 3) {
        rowsList = [
            { start: 0, end: Math.floor(height/3)-1 },
            { start: Math.floor(height/3), end: Math.floor(height*2/3)-1 },
            { start: Math.floor(height*2/3), end: height-1 }
        ];
    } else if (rowsList.length > 3) {
        rowsList.sort((a, b) => (b.end - b.start) - (a.end - a.start));
        rowsList = rowsList.slice(0, 3).sort((a, b) => a.start - b.start);
    }

    const cols = 6;
    const cellW = Math.floor(width / cols);
    
    const frames = [];
    let maxCropW = 0;
    let maxCropH = 0;
    
    for (let r = 0; r < 3; r++) {
        const rowFrames = [];
        const rStart = rowsList[r].start;
        const rEnd = rowsList[r].end;
        
        for (let c = 0; c < cols; c++) {
            let minX = width, minY = height, maxX = 0, maxY = 0;
            let hasPixels = false;
            
            for (let y = rStart; y <= rEnd; y++) {
                for (let x = c * cellW; x < (c + 1) * cellW; x++) {
                    const idx = (width * y + x) << 2;
                    const alpha = png.data[idx+3];
                    if (alpha > 0) {
                        hasPixels = true;
                        const localX = x - (c * cellW);
                        const localY = y - rStart;
                        if (localX < minX) minX = localX;
                        if (localX > maxX) maxX = localX;
                        if (localY < minY) minY = localY;
                        if (localY > maxY) maxY = localY;
                    }
                }
            }
            
            if (hasPixels) {
                const cropW = maxX - minX + 1;
                const cropH = maxY - minY + 1;
                if (cropW > maxCropW) maxCropW = cropW;
                if (cropH > maxCropH) maxCropH = cropH;
                
                const frameData = Buffer.alloc(cropW * cropH * 4);
                for (let y = 0; y < cropH; y++) {
                    for (let x = 0; x < cropW; x++) {
                        const globalY = rStart + minY + y;
                        const globalX = c * cellW + minX + x;
                        const srcIdx = (width * globalY + globalX) << 2;
                        const dstIdx = (cropW * y + x) << 2;
                        frameData[dstIdx] = png.data[srcIdx];
                        frameData[dstIdx+1] = png.data[srcIdx+1];
                        frameData[dstIdx+2] = png.data[srcIdx+2];
                        frameData[dstIdx+3] = png.data[srcIdx+3];
                    }
                }
                rowFrames.push({ hasPixels: true, data: frameData, width: cropW, height: cropH });
            } else {
                rowFrames.push({ hasPixels: false });
            }
        }
        frames.push(rowFrames);
    }
    
    const pad = 2;
    const finalCellW = maxCropW + pad * 2;
    const finalCellH = maxCropH + pad * 2;
    const finalWidth = finalCellW * cols;
    const finalHeight = finalCellH * 3;
    
    const finalPng = new PNG({ width: finalWidth, height: finalHeight });
    
    if (config.fixWatermark) {
        frames[2][5] = frames[2][4];
    }
    
    if (config.fixGirlGap) {
        frames[2][2] = frames[2][1];
        frames[2][3] = frames[2][4];
    }
    
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < cols; c++) {
            const frame = frames[r][c];
            if (frame && frame.hasPixels) {
                const destX = c * finalCellW + Math.floor((finalCellW - frame.width) / 2);
                const destY = r * finalCellH + (finalCellH - frame.height) - pad;
                
                for (let y = 0; y < frame.height; y++) {
                    for (let x = 0; x < frame.width; x++) {
                        const srcIdx = (frame.width * y + x) << 2;
                        const dstIdx = (finalWidth * (destY + y) + (destX + x)) << 2;
                        finalPng.data[dstIdx] = frame.data[srcIdx];
                        finalPng.data[dstIdx+1] = frame.data[srcIdx+1];
                        finalPng.data[dstIdx+2] = frame.data[srcIdx+2];
                        finalPng.data[dstIdx+3] = frame.data[srcIdx+3];
                    }
                }
            }
        }
    }
    
    fs.writeFileSync(outputFile, PNG.sync.write(finalPng));
    console.log(`Processed and saved to ${outputFile}`);
}

processImage(path.join(basePath, 'classmate1_raw.png'), path.join(basePath, 'classmate1.png'), { fixWatermark: true });
processImage(path.join(basePath, 'classmate2_raw.png'), path.join(basePath, 'classmate2.png'), { fixGirlGap: true });
processImage(path.join(basePath, 'classmate3_raw.png'), path.join(basePath, 'classmate3.png'), { fixWatermark: true });

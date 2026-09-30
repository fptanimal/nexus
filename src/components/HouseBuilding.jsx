import React, { useRef, useEffect } from 'react';

export default function HouseBuilding() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, 256, 256);

    // Absolutely NO smoothing
    ctx.imageSmoothingEnabled = false;

    // Helper for hard-edged outlines (1px thick now to match 1x1 scale)
    const drawOutline = (x, y, w, h, outColor, inColor) => {
      ctx.fillStyle = outColor;
      ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
      ctx.fillStyle = inColor;
      ctx.fillRect(x, y, w, h);
    };

    // --- 1. Chimney ---
    // x=188, y=8, w=24, h=60
    drawOutline(188, 8, 24, 60, '#450a0a', '#ea580c');
    // Chimney texture (flat 1x1 scale pixels)
    ctx.fillStyle = '#c2410c';
    for(let cy = 12; cy < 68; cy += 4) {
       let offsetX = (cy % 8 === 0) ? 0 : 3;
       for(let cx = 188 + offsetX; cx < 212; cx += 7) {
          if (cx + 5 <= 212) {
             ctx.fillRect(cx, cy, 5, 2);
          }
       }
    }

    // --- 2. Walls ---
    // Wall box (centered, 216 wide, 192 high)
    drawOutline(20, 64, 216, 192, '#450a0a', '#fef3c7');
    
    // ONE hard-edged vertical band of slightly darker shade for depth (NO GRADIENT)
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(204, 64, 32, 192);
    
    // Base stone texture (bottom 16px) with 1px cracks
    ctx.fillStyle = '#d6d3d1';
    ctx.fillRect(20, 240, 216, 16); 
    ctx.fillStyle = '#a8a29e'; // Darker stone flat lines (1px)
    for(let y = 240; y < 256; y += 4) {
       ctx.fillRect(20, y, 216, 1); // horizontal cracks
       let offsetX = (y % 8 === 0) ? 0 : 4;
       for(let x = 20 + offsetX; x < 236; x += 8) {
          ctx.fillRect(x, y, 1, 4); // vertical cracks
       }
    }

    // --- 3. Roof ---
    // Stair-stepped trapezoid, perfectly flat colors
    ctx.fillStyle = '#450a0a'; // Roof outline
    
    // Draw stair-stepped outline (1px steps)
    for (let i = 0; i < 52; i++) {
       // Left slope
       ctx.fillRect(52 - i, 16 + i, 2, 1);
       // Right slope
       ctx.fillRect(202 + i, 16 + i, 2, 1);
    }
    // Roof top edge
    ctx.fillRect(52, 15, 152, 1);
    // Roof bottom edge
    ctx.fillRect(0, 68, 256, 1);
    
    // Fill roof body
    ctx.fillStyle = '#991b1b'; // Base red roof
    for (let i = 0; i < 52; i++) {
       ctx.fillRect(52 - i + 1, 16 + i, 150 + i*2, 1); // Fill inside the outline
    }
    
    // Bottom flap of roof
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(1, 65, 254, 3);
    
    // Roof texture (1-unit wide stripes, perfectly matching grass pixel scale)
    ctx.fillStyle = '#7f1d1d';
    for (let x = 4; x < 252; x += 4) {
       for(let y = 17; y < 65; y++) {
          let leftBound = 52 - (y - 16);
          let rightBound = 204 + (y - 16);
          if (x >= leftBound && x <= rightBound) {
             ctx.fillRect(x, y, 1, 1); // 1px vertical line
             // Horizontal tile separators every 6px, staggered
             let isStaggered = (x % 8 === 0);
             let yCheck = isStaggered ? (y % 6 === 0) : (y % 6 === 3);
             if (yCheck && x + 3 <= rightBound) {
                 ctx.fillRect(x, y, 4, 1); 
             }
          }
       }
    }

    // --- 4. Windows ---
    const drawWindow = (wx, wy) => {
       drawOutline(wx, wy, 48, 48, '#450a0a', '#78350f'); // Window frame
       
       // Inner glass (Flat base color, NO diagonal gloss/gradient)
       ctx.fillStyle = '#38bdf8';
       ctx.fillRect(wx+2, wy+2, 44, 44);
       
       // Frame cross (2px thick)
       ctx.fillStyle = '#78350f';
       ctx.fillRect(wx+23, wy, 2, 48);
       ctx.fillRect(wx, wy+23, 48, 2);
       
       // EXACTLY 2 small solid-color square highlight pixels (1x1 pixel-art style, no streak)
       ctx.fillStyle = '#bae6fd'; // highlight flat color
       // Top-left pane highlight
       ctx.fillRect(wx+4, wy+4, 1, 1);
       ctx.fillRect(wx+6, wy+4, 1, 1);
       // Top-right pane highlight
       ctx.fillRect(wx+26, wy+4, 1, 1);
       ctx.fillRect(wx+28, wy+4, 1, 1);
    };
    drawWindow(40, 104); // Left window
    drawWindow(168, 104); // Right window

    // --- 5. Door ---
    // Center is 128. Door width 64 => x=96
    const dx = 96;
    const dy = 168;
    const dw = 64;
    const dh = 72;
    drawOutline(dx, dy, dw, dh, '#450a0a', '#78350f');
    
    // Door panels
    ctx.fillStyle = '#451a03'; // Flat darker wood panels
    // 1px borders for the panels to match the 1:1 scale
    const drawPanel = (px, py, pw, ph) => {
        ctx.fillRect(px, py, pw, 1);
        ctx.fillRect(px, py+ph-1, pw, 1);
        ctx.fillRect(px, py, 1, ph);
        ctx.fillRect(px+pw-1, py, 1, ph);
    };
    drawPanel(dx+8, dy+8, 20, 28);
    drawPanel(dx+36, dy+8, 20, 28);
    drawPanel(dx+8, dy+40, 20, 24);
    drawPanel(dx+36, dy+40, 20, 24);
    
    // Doorknob (single 2x2 flat pixel block)
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(dx+54, dy+38, 2, 2);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(dx+55, dy+40, 1, 1); // Doorknob shadow

  }, []);

  return (
    <div 
      className="origin-bottom-left"
      style={{ 
        width: '256px',
        height: '256px',
        zIndex: 10,
        position: 'absolute'
      }}
    >
      <canvas 
        ref={canvasRef}
        width={256}
        height={256}
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated'
        }}
      />
    </div>
  );
}

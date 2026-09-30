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

    // Helper for hard-edged outlines (2px thick for consistency with environment)
    const drawOutline = (x, y, w, h, outColor, inColor) => {
      ctx.fillStyle = outColor;
      ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
      ctx.fillStyle = inColor;
      ctx.fillRect(x, y, w, h);
    };

    // --- 1. Chimney ---
    // x=188, y=8, w=24, h=60
    drawOutline(188, 8, 24, 60, '#450a0a', '#ea580c');
    // Chimney texture (flat pixels, 1x1 scale)
    ctx.fillStyle = '#c2410c'; // darker flat orange
    ctx.fillRect(192, 16, 8, 4);
    ctx.fillRect(200, 24, 8, 4);
    ctx.fillRect(190, 36, 12, 4);
    ctx.fillRect(204, 44, 6, 4);
    ctx.fillRect(192, 56, 10, 4);

    // --- 2. Walls ---
    // Wall box (centered, 216 wide, 192 high)
    drawOutline(20, 64, 216, 192, '#450a0a', '#fef3c7');
    
    // ONE hard-edged vertical band of slightly darker shade for depth (NO GRADIENT)
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(204, 64, 32, 192);
    
    // Base stone texture (bottom 16px)
    ctx.fillStyle = '#d6d3d1';
    ctx.fillRect(20, 240, 216, 16); 
    ctx.fillStyle = '#a8a29e'; // Darker stone flat lines
    for(let i = 20; i < 236; i+=16) {
       ctx.fillRect(i, 240, 2, 16); // vertical cracks
       ctx.fillRect(i+8, 248, 16, 2); // horizontal cracks
    }

    // --- 3. Roof ---
    // Stair-stepped trapezoid, perfectly flat colors
    ctx.fillStyle = '#450a0a'; // Roof outline
    
    // Draw stair-stepped outline
    for (let i = 0; i < 52; i++) {
       // Left slope
       ctx.fillRect(52 - i, 16 + i, 4, 2);
       // Right slope
       ctx.fillRect(200 + i, 16 + i, 4, 2);
    }
    // Roof top edge
    ctx.fillRect(52, 14, 152, 4);
    // Roof bottom edge
    ctx.fillRect(0, 66, 256, 4);
    
    // Fill roof body
    ctx.fillStyle = '#991b1b'; // Base red roof
    for (let i = 0; i < 50; i++) {
       ctx.fillRect(52 - i, 16 + i, 152 + i*2, 2);
    }
    
    // Bottom flap of roof
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(2, 62, 252, 4);
    
    // Roof texture (vertical pixel lines, flat, no blend)
    ctx.fillStyle = '#7f1d1d';
    for (let x = 32; x < 224; x+=16) {
       for(let y = 20; y < 62; y++) {
          let leftBound = 52 - (y - 16);
          let rightBound = 204 + (y - 16);
          if (x >= leftBound && x <= rightBound) {
             ctx.fillRect(x, y, 2, 2);
             if (y % 8 === 0) ctx.fillRect(x+2, y, 4, 2); // Hard flat cross-hatch
          }
       }
    }

    // --- 4. Windows ---
    const drawWindow = (wx, wy) => {
       drawOutline(wx, wy, 48, 48, '#450a0a', '#78350f'); // Window frame
       
       // Inner glass (Flat base color, NO diagonal gloss/gradient)
       ctx.fillStyle = '#38bdf8';
       ctx.fillRect(wx+4, wy+4, 40, 40);
       
       // Frame cross
       ctx.fillStyle = '#78350f';
       ctx.fillRect(wx+22, wy, 4, 48);
       ctx.fillRect(wx, wy+22, 48, 4);
       
       // EXACTLY 2 small solid-color square highlight pixels (pixel-art style, no streak)
       ctx.fillStyle = '#bae6fd'; // highlight flat color
       // Top-left pane highlight
       ctx.fillRect(wx+6, wy+6, 4, 4);
       ctx.fillRect(wx+12, wy+6, 2, 2);
       // Top-right pane highlight
       ctx.fillRect(wx+28, wy+6, 4, 4);
       ctx.fillRect(wx+34, wy+6, 2, 2);
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
    ctx.fillRect(dx+8, dy+8, 20, 28);
    ctx.fillRect(dx+36, dy+8, 20, 28);
    ctx.fillRect(dx+8, dy+40, 20, 24);
    ctx.fillRect(dx+36, dy+40, 20, 24);
    
    // Doorknob (single flat pixel block)
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(dx+52, dy+36, 4, 8);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(dx+54, dy+40, 2, 4); // Doorknob shadow

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

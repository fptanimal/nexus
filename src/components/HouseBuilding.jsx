import React, { useRef, useEffect } from 'react';

export default function HouseBuilding() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, 128, 128);

    // No smoothing for crisp pixel edges
    ctx.imageSmoothingEnabled = false;

    // Helper for black outlines
    const drawOutline = (x, y, w, h, outColor, inColor) => {
      ctx.fillStyle = outColor;
      ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
      ctx.fillStyle = inColor;
      ctx.fillRect(x, y, w, h);
    };

    // --- 1. Chimney ---
    // x=90, y=4, w=12, h=30
    drawOutline(94, 4, 12, 30, '#450a0a', '#ea580c');
    // Chimney texture (bricks)
    ctx.fillStyle = '#c2410c'; // darker orange
    ctx.fillRect(96, 8, 4, 2);
    ctx.fillRect(100, 12, 4, 2);
    ctx.fillRect(95, 18, 6, 2);
    ctx.fillRect(102, 22, 3, 2);
    ctx.fillRect(96, 28, 5, 2);

    // --- 2. Walls ---
    // Wall box (centered, 108 wide, 96 high)
    drawOutline(10, 32, 108, 96, '#450a0a', '#fef3c7');
    
    // Wall shadow (right side depth)
    ctx.fillStyle = '#fde68a'; // darker cream
    ctx.fillRect(102, 32, 16, 96);
    
    // Base stone texture for wall (bottom 8px)
    ctx.fillStyle = '#d6d3d1';
    ctx.fillRect(10, 120, 108, 8); // Base stone
    ctx.fillStyle = '#a8a29e'; // Darker stone lines
    for(let i = 10; i < 118; i+=8) {
       ctx.fillRect(i, 120, 1, 8); // vertical cracks
       ctx.fillRect(i+4, 124, 8, 1); // horizontal cracks
    }

    // --- 3. Roof ---
    // Roof is a stair-stepped trapezoid
    ctx.fillStyle = '#450a0a'; // Roof outline
    // Draw stair-stepped outline
    for (let i = 0; i < 26; i++) {
       // Left slope
       ctx.fillRect(26 - i, 8 + i, 2, 1);
       ctx.fillRect(25 - i, 9 + i, 2, 1);
       // Right slope
       ctx.fillRect(100 + i, 8 + i, 2, 1); 
       ctx.fillRect(101 + i, 9 + i, 2, 1);
    }
    // Roof top edge
    ctx.fillRect(26, 7, 76, 2);
    // Roof bottom edge
    ctx.fillRect(0, 33, 128, 2);
    
    // Fill roof body (stair-stepped)
    ctx.fillStyle = '#991b1b'; // Red roof
    for (let i = 0; i < 25; i++) {
       ctx.fillRect(26 - i, 8 + i, 76 + i*2, 1);
    }
    // Bottom flap of roof (shadow)
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(1, 31, 126, 2);
    
    // Roof texture (vertical pixel planks & tiles)
    ctx.fillStyle = '#7f1d1d';
    for (let x = 16; x < 112; x+=8) {
       // Draw vertical lines inside roof body
       for(let y = 10; y < 31; y++) {
          let leftBound = 26 - (y - 8);
          let rightBound = 102 + (y - 8);
          if (x >= leftBound && x <= rightBound) {
             ctx.fillRect(x, y, 1, 1);
             // Cross hatch texture
             if (y % 4 === 0) ctx.fillRect(x+1, y, 2, 1); 
          }
       }
    }

    // --- 4. Windows ---
    const drawWindow = (wx, wy) => {
       drawOutline(wx, wy, 24, 24, '#450a0a', '#78350f'); // Window frame
       // Inner glass
       ctx.fillStyle = '#38bdf8';
       ctx.fillRect(wx+2, wy+2, 20, 20);
       // Frame cross
       ctx.fillStyle = '#78350f';
       ctx.fillRect(wx+11, wy, 2, 24);
       ctx.fillRect(wx, wy+11, 24, 2);
       // Glass highlights (pixels, no gradient)
       ctx.fillStyle = '#bae6fd';
       ctx.fillRect(wx+3, wy+3, 6, 2);
       ctx.fillRect(wx+3, wy+5, 2, 3);
       ctx.fillRect(wx+14, wy+3, 6, 2);
       ctx.fillRect(wx+14, wy+5, 2, 3);
       // Glass shadow (bottom right of panes)
       ctx.fillStyle = '#0284c7';
       ctx.fillRect(wx+8, wy+8, 2, 2);
       ctx.fillRect(wx+20, wy+8, 2, 2);
       ctx.fillRect(wx+8, wy+20, 2, 2);
       ctx.fillRect(wx+20, wy+20, 2, 2);
    };
    drawWindow(20, 52); // Left window
    drawWindow(84, 52); // Right window

    // --- 5. Door ---
    // Center is 64. Door width 32 => x=48
    const dx = 48;
    const dy = 84;
    const dw = 32;
    const dh = 36;
    drawOutline(dx, dy, dw, dh, '#450a0a', '#78350f');
    // Door panels
    ctx.fillStyle = '#451a03'; // Darker wood panels
    ctx.fillRect(dx+4, dy+4, 10, 14);
    ctx.fillRect(dx+18, dy+4, 10, 14);
    ctx.fillRect(dx+4, dy+20, 10, 12);
    ctx.fillRect(dx+18, dy+20, 10, 12);
    
    // Doorknob (gold pixel)
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(dx+26, dy+18, 2, 4);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(dx+27, dy+20, 1, 2); // Doorknob shadow

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
        width={128}
        height={128}
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated'
        }}
      />
    </div>
  );
}

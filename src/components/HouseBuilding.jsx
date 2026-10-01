import React from 'react';

export default function HouseBuilding() {
  return (
    <div 
      className="origin-bottom-left"
      style={{ 
        width: '256px',
        height: '256px',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        position: 'absolute'
      }}
    >
      {/* Chimney */}
      <div style={{
          position: 'absolute',
          top: '32px',
          right: '48px',
          width: '32px',
          height: '64px',
          backgroundColor: '#ea580c',
          border: '4px solid #450a0a',
          zIndex: 1
      }}>
          {/* flat detail lines to match pixel block texture */}
          <div style={{ width: '100%', height: '4px', backgroundColor: '#c2410c', marginTop: '12px' }} />
          <div style={{ width: '100%', height: '4px', backgroundColor: '#c2410c', marginTop: '16px' }} />
      </div>

      {/* Roof */}
      <div 
        style={{
          width: '90%', 
          height: '80px',
          backgroundColor: '#991b1b', // Red roof
          border: '4px solid #450a0a',
          borderBottom: 'none',
          position: 'relative',
          zIndex: 2,
          // Pattern gạch / tấm ốp pixel (4px scale)
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.1) 4px, transparent 4px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.1) 4px, transparent 4px)
          `,
          backgroundSize: '32px 32px'
        }}
      >
        {/* Roof bottom flap */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: '-4px', // extend over borders
          width: 'calc(100% + 8px)',
          height: '12px',
          backgroundColor: '#7f1d1d',
          border: '4px solid #450a0a'
        }} />
      </div>

      {/* Main Walls */}
      <div 
        style={{
          width: '80%',
          height: '160px',
          backgroundColor: '#fef3c7', // Cream
          border: '4px solid #450a0a',
          borderBottom: '4px solid #270606',
          borderTop: 'none',
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: 'inset -16px 0 0 rgba(0,0,0,0.05)',
          // Pattern gạch / tấm ốp pixel
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.03) 4px, transparent 4px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.03) 4px, transparent 4px)
          `,
          backgroundSize: '32px 32px'
        }}
      >
        {/* Base stone layer */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '24px',
          backgroundColor: '#d6d3d1',
          borderTop: '4px solid #450a0a',
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.1) 4px, transparent 4px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.1) 4px, transparent 4px)
          `,
          backgroundSize: '16px 16px'
        }} />

        {/* Windows */}
        <div style={{ display: 'flex', gap: '48px', marginTop: '32px', zIndex: 5 }}>
            {[1, 2].map(i => (
              <div key={i} style={{ 
                  width: '48px', height: '48px', 
                  backgroundColor: '#38bdf8', 
                  border: '4px solid #450a0a', 
                  position: 'relative',
                  boxShadow: 'inset 4px 4px 0 rgba(0,0,0,0.1)'
              }}>
                  {/* Window Cross */}
                  <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '4px', height: '100%', backgroundColor: '#450a0a' }} />
                  <div style={{ position: 'absolute', top: '50%', left: 0, transform: 'translateY(-50%)', width: '100%', height: '4px', backgroundColor: '#450a0a' }} />
                  {/* Highlight */}
                  <div style={{ position: 'absolute', top: '4px', left: '4px', width: '8px', height: '8px', backgroundColor: '#bae6fd' }} />
                  <div style={{ position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px', backgroundColor: '#bae6fd' }} />
              </div>
            ))}
        </div>

        {/* Door */}
        <div style={{
          position: 'absolute',
          bottom: 0, // sit on base
          width: '64px',
          height: '72px',
          backgroundColor: '#78350f',
          border: '4px solid #450a0a',
          borderBottom: 'none',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 5
        }}>
           {/* Door panels */}
           <div style={{ position: 'absolute', top: '8px', left: '8px', width: '20px', height: '24px', border: '4px solid #451a03' }} />
           <div style={{ position: 'absolute', top: '8px', right: '8px', width: '20px', height: '24px', border: '4px solid #451a03' }} />
           <div style={{ position: 'absolute', bottom: '8px', left: '8px', width: '20px', height: '24px', border: '4px solid #451a03' }} />
           <div style={{ position: 'absolute', bottom: '8px', right: '8px', width: '20px', height: '24px', border: '4px solid #451a03' }} />
           {/* Doorknob */}
           <div style={{ position: 'absolute', top: '50%', right: '8px', width: '6px', height: '6px', backgroundColor: '#fbbf24' }} />
        </div>
      </div>
      
      {/* Lớp phủ Dither Pixel (để làm mịn hòa trộn khối) */}
      <div style={pixelOverlayStyle} />
    </div>
  );
}

const pixelOverlayStyle = {
  position: 'absolute', top: '0', left: 0, width: '100%', height: '100%',
  pointerEvents: 'none', zIndex: 50,
  backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='4' height='4'><rect width='2' height='2' fill='rgba(0,0,0,0.08)'/><rect x='2' y='2' width='2' height='2' fill='rgba(0,0,0,0.08)'/><rect x='2' y='0' width='2' height='2' fill='rgba(255,255,255,0.02)'/><rect x='0' y='2' width='2' height='2' fill='rgba(255,255,255,0.02)'/></svg>")`,
  backgroundSize: '4px 4px',
  mixBlendMode: 'overlay'
};

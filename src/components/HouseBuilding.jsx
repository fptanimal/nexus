import React from 'react';

export default function HouseBuilding() {
  return (
    <div 
      className="origin-bottom-left"
      style={{ 
        width: '256px', // 8 tiles * 32px
        height: '256px', // 8 tiles * 32px
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        position: 'absolute'
      }}
    >
      {/* Mái nhà (Nâu đỏ ngói) */}
      <div style={{
          width: '110%',
          height: '64px',
          backgroundColor: '#991b1b',
          border: '4px solid #450a0a',
          borderBottom: '8px solid #7f1d1d',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 11,
          boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
          clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)', // Mái hình thang
          backgroundImage: `
            linear-gradient(90deg, rgba(0,0,0,0.1) 4px, transparent 4px)
          `,
          backgroundSize: '16px 16px'
        }}
      >
        {/* Ống khói */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '20%',
          width: '24px',
          height: '40px',
          backgroundColor: '#ea580c',
          border: '4px solid #7c2d12',
          zIndex: -1
        }} />
      </div>

      {/* Tường nhà */}
      <div style={{
          width: '100%',
          height: '192px',
          backgroundColor: '#fef3c7', // Màu tường vàng kem nhạt
          border: '4px solid #b45309',
          borderTop: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          boxShadow: 'inset -16px 0 0 rgba(0,0,0,0.05)'
        }}
      >
        {/* Cửa sổ 1 */}
        <div style={{ position: 'absolute', top: '40px', left: '32px', width: '48px', height: '48px', backgroundColor: '#38bdf8', border: '4px solid #78350f', boxShadow: 'inset 4px 4px 0 rgba(0,0,0,0.2)' }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: '4px', backgroundColor: '#78350f' }} />
          <div style={{ position: 'absolute', top: 0, left: '50%', width: '4px', height: '100%', backgroundColor: '#78350f' }} />
        </div>

        {/* Cửa sổ 2 */}
        <div style={{ position: 'absolute', top: '40px', right: '32px', width: '48px', height: '48px', backgroundColor: '#38bdf8', border: '4px solid #78350f', boxShadow: 'inset 4px 4px 0 rgba(0,0,0,0.2)' }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: '4px', backgroundColor: '#78350f' }} />
          <div style={{ position: 'absolute', top: 0, left: '50%', width: '4px', height: '100%', backgroundColor: '#78350f' }} />
        </div>

        {/* Cửa chính */}
        <div style={{ 
          position: 'absolute', 
          bottom: 0, 
          left: '96px', // Giữa (256/2 = 128, cửa 64px => left 96)
          width: '64px', 
          height: '80px', 
          backgroundColor: '#78350f', // Gỗ đậm
          border: '4px solid #450a0a',
          borderBottom: 'none',
          borderRadius: '8px 8px 0 0'
        }}>
          {/* Tay nắm cửa */}
          <div style={{ position: 'absolute', top: '50%', right: '8px', width: '8px', height: '16px', backgroundColor: '#fbbf24', borderRadius: '4px' }} />
        </div>
      </div>
    </div>
  );
}

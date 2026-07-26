import React from 'react';

export default function LibraryBuilding() {
  return (
    <div 
      className="origin-bottom-left"
      style={{ 
        width: '224px', 
        height: '224px',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        position: 'absolute'
      }}
    >
      {/* Mái chính (Main Roof) */}
      <div 
        style={{
          width: '100%',
          height: '64px',
          backgroundColor: '#c46045', 
          border: '4px solid #5a2618',
          borderBottom: 'none',
          borderRadius: '16px 16px 0 0',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 11,
          boxShadow: 'inset 0 -4px 0 rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ position: 'absolute', top: '25%', left: 0, width: '100%', height: '3px', backgroundColor: 'rgba(0,0,0,0.15)' }} />
        <div style={{ position: 'absolute', top: '55%', left: 0, width: '100%', height: '3px', backgroundColor: 'rgba(0,0,0,0.15)' }} />
      </div>

      {/* Mái bạt (Awning) */}
      <div style={{
        width: '104%',
        height: '24px',
        backgroundImage: 'repeating-linear-gradient(to right, #d44d42 0%, #d44d42 16px, #fdf6e3 16px, #fdf6e3 32px)',
        border: '3px solid #5a2618',
        borderRadius: '6px',
        position: 'relative',
        zIndex: 12,
        boxShadow: '0 8px 12px rgba(0,0,0,0.3)',
        marginLeft: '-2%',
        marginRight: '-2%'
      }}>
        <div style={{
          position: 'absolute', bottom: '-8px', left: '-3px', width: 'calc(100% + 6px)', height: '10px',
          backgroundImage: 'radial-gradient(circle at 8px 0, transparent 0%, transparent 7px, #5a2618 8px, #5a2618 10px, transparent 11px)',
          backgroundSize: '16px 10px',
          backgroundRepeat: 'repeat-x',
          zIndex: -1
        }} />
        <div style={{
          position: 'absolute', bottom: '-5px', left: 0, width: '100%', height: '8px',
          backgroundImage: 'radial-gradient(circle at 8px 0, transparent 0%, transparent 7px, #d44d42 8px, #d44d42 10px, transparent 11px)',
          backgroundSize: '32px 10px',
          backgroundRepeat: 'repeat-x'
        }} />
      </div>

      {/* Tường chính */}
      <div 
        style={{
          width: '94%',
          height: '144px',
          background: 'linear-gradient(to bottom, #ebdcc5 0%, #dcd0b8 100%)',
          border: '4px solid #82684b',
          borderTop: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          borderRadius: '0 0 16px 16px',
          boxShadow: 'inset -12px 0 0 rgba(100,70,40,0.1)'
        }}
      >
        {/* Dây leo */}
        <div style={{ position: 'absolute', top: 0, left: '-4px', width: '16px', height: '48px', backgroundColor: '#4d7c2b', borderRadius: '0 0 12px 8px', border: '3px solid #335918', borderTop: 'none', zIndex: 5 }} />
        <div style={{ position: 'absolute', top: '16px', left: '8px', width: '12px', height: '12px', backgroundColor: '#63a334', borderRadius: '50%', border: '2px solid #335918', zIndex: 5 }} />
        <div style={{ position: 'absolute', top: '32px', left: '-8px', width: '14px', height: '14px', backgroundColor: '#528a2a', borderRadius: '50%', border: '2px solid #335918', zIndex: 5 }} />
        
        <div style={{ position: 'absolute', top: 0, right: '-4px', width: '14px', height: '36px', backgroundColor: '#4d7c2b', borderRadius: '0 0 8px 12px', border: '3px solid #335918', borderTop: 'none', zIndex: 5 }} />
        <div style={{ position: 'absolute', top: '24px', right: '4px', width: '12px', height: '12px', backgroundColor: '#528a2a', borderRadius: '50%', border: '2px solid #335918', zIndex: 5 }} />

        {/* Cửa sổ trái (Làm khung viền chi tiết, thêm lưới cửa) */}
        <div style={{ position: 'absolute', left: '16px', top: '36px', width: '60px', height: '60px', backgroundColor: '#2a1a14', border: '4px solid #4a3324', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: 'inset 0 6px 12px rgba(0,0,0,0.8), 0 4px 0 rgba(0,0,0,0.15)' }}>
          {/* Thanh ngang chia kính */}
          <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: '3px', backgroundColor: '#4a3324', zIndex: 2 }} />
          
          <div style={{ width: '100%', height: '50%', position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '0 4px', zIndex: 1 }}>
            <div style={{ width: '8px', height: '18px', backgroundColor: '#c76e58', border: '2px solid #1f120e', marginRight: '2px', borderRadius: '2px' }} />
            <div style={{ width: '12px', height: '22px', backgroundColor: '#5891c7', border: '2px solid #1f120e', marginRight: '2px', borderRadius: '2px' }} />
            <div style={{ width: '6px', height: '20px', backgroundColor: '#c7b958', border: '2px solid #1f120e', transform: 'rotate(15deg)', transformOrigin: 'bottom left', borderRadius: '2px' }} />
          </div>
          <div style={{ width: '100%', height: '50%', position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '0 4px', zIndex: 1 }}>
            <div style={{ width: '14px', height: '16px', backgroundColor: '#e8cfa7', border: '2px solid #1f120e', marginRight: '2px', borderRadius: '2px' }} />
            <div style={{ width: '8px', height: '14px', backgroundColor: '#63c758', border: '2px solid #1f120e', marginRight: '2px', borderRadius: '2px' }} />
            <div style={{ width: '24px', height: '6px', backgroundColor: '#c75889', border: '2px solid #1f120e', marginBottom: '4px', borderRadius: '2px' }} />
          </div>
          {/* Lớp kính sáng */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '200%', height: '100%', background: 'linear-gradient(135deg, rgba(120,200,255,0.2) 0%, rgba(255,255,255,0) 40%)', pointerEvents: 'none', zIndex: 3 }} />
        </div>

        {/* Cửa sổ phải */}
        <div style={{ position: 'absolute', right: '16px', top: '36px', width: '60px', height: '60px', backgroundColor: '#2a1a14', border: '4px solid #4a3324', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: 'inset 0 6px 12px rgba(0,0,0,0.8), 0 4px 0 rgba(0,0,0,0.15)' }}>
          {/* Thanh ngang chia kính */}
          <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: '3px', backgroundColor: '#4a3324', zIndex: 2 }} />
          
          <div style={{ width: '100%', height: '50%', position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '0 4px', justifyContent: 'flex-end', zIndex: 1 }}>
             <div style={{ width: '10px', height: '16px', backgroundColor: '#8a58c7', border: '2px solid #1f120e', marginRight: '4px', borderRadius: '2px' }} />
             <div style={{ width: '14px', height: '18px', backgroundColor: '#58c7bc', border: '2px solid #1f120e', borderRadius: '2px' }} />
          </div>
          <div style={{ width: '100%', height: '50%', position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '0 4px', zIndex: 1 }}>
            <div style={{ width: '10px', height: '24px', backgroundColor: '#c73030', border: '2px solid #1f120e', marginRight: '2px', borderRadius: '2px' }} />
            <div style={{ width: '8px', height: '20px', backgroundColor: '#e38a22', border: '2px solid #1f120e', marginRight: '2px', borderRadius: '2px' }} />
            <div style={{ width: '6px', height: '22px', backgroundColor: '#e3d622', border: '2px solid #1f120e', transform: 'rotate(10deg)', transformOrigin: 'bottom left', borderRadius: '2px' }} />
          </div>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '200%', height: '100%', background: 'linear-gradient(135deg, rgba(120,200,255,0.2) 0%, rgba(255,255,255,0) 40%)', pointerEvents: 'none', zIndex: 3 }} />
        </div>

        {/* Bảng hiệu */}
        <div style={{
          position: 'absolute',
          top: '-14px',
          backgroundColor: '#402a1e',
          padding: '6px 20px',
          border: '4px solid #634531',
          borderRadius: '12px',
          color: '#fcdb5d',
          fontFamily: 'var(--font-sans)',
          fontSize: '15px',
          fontWeight: 'bold',
          letterSpacing: '3px',
          zIndex: 15,
          boxShadow: '0 6px 0 rgba(0,0,0,0.25)'
        }}>
          LIBRARY
        </div>

        {/* Cửa gỗ đôi tinh xảo hơn */}
        <div style={{
          position: 'absolute',
          bottom: '0',
          width: '76px',
          height: '60px',
          backgroundColor: '#4a2f1d',
          border: '4px solid #2d1a10',
          borderBottom: 'none',
          borderRadius: '16px 16px 0 0',
          display: 'flex',
          justifyContent: 'center',
          boxShadow: 'inset 0 8px 0 rgba(0,0,0,0.2), 0 0 10px rgba(0,0,0,0.1)'
        }}>
          {createLibraryDoor('left')}
          {createLibraryDoor('right')}
        </div>
        <div style={{ position: 'absolute', bottom: '-4px', width: '84px', height: '4px', backgroundColor: '#9ca3af', border: '2px solid #6b7280', borderRadius: '2px' }} />


        {/* Bệ cây trang trí */}
        <div style={{ position: 'absolute', bottom: '0', left: '12px', width: '56px', height: '14px', backgroundColor: '#9e6d42', border: '3px solid #6b4b2c', borderRadius: '8px', display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start', boxShadow: '0 4px 0 rgba(0,0,0,0.15)' }}>
          <div style={{ position: 'relative', width: '20px', height: '20px', marginTop: '-14px' }}>
            <div style={{ position: 'absolute', top: '2px', left: '-2px', width: '14px', height: '14px', backgroundColor: '#556b2f', border: '3px solid #3c4d21', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', top: 0, right: '-2px', width: '16px', height: '16px', backgroundColor: '#6b8e23', border: '3px solid #3c4d21', borderRadius: '50%' }} />
          </div>
        </div>
        
        <div style={{ position: 'absolute', bottom: '0', right: '12px', width: '56px', height: '14px', backgroundColor: '#9e6d42', border: '3px solid #6b4b2c', borderRadius: '8px', display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start', boxShadow: '0 4px 0 rgba(0,0,0,0.15)' }}>
          <div style={{ position: 'relative', width: '20px', height: '20px', marginTop: '-14px' }}>
            <div style={{ position: 'absolute', top: 0, left: '-2px', width: '16px', height: '16px', backgroundColor: '#6b8e23', border: '3px solid #3c4d21', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', top: '2px', right: '-2px', width: '14px', height: '14px', backgroundColor: '#556b2f', border: '3px solid #3c4d21', borderRadius: '50%' }} />
          </div>
        </div>
      </div>

      {/* Lớp phủ Pixel/Dither để tạo cảm giác Pixel Art */}
      <div style={pixelOverlayStyle} />
    </div>
  );
}

const pixelOverlayStyle = {
  position: 'absolute', top: '-14px', left: 0, width: '100%', height: 'calc(100% + 14px)',
  pointerEvents: 'none', zIndex: 50,
  backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='4' height='4'><rect width='2' height='2' fill='rgba(0,0,0,0.08)'/><rect x='2' y='2' width='2' height='2' fill='rgba(0,0,0,0.08)'/><rect x='2' y='0' width='2' height='2' fill='rgba(255,255,255,0.03)'/><rect x='0' y='2' width='2' height='2' fill='rgba(255,255,255,0.03)'/></svg>")`,
  backgroundSize: '4px 4px',
  mixBlendMode: 'overlay'
};

function createLibraryDoor(side) {
  const isLeft = side === 'left';
  return (
    <div style={{ 
      width: '50%', height: '100%', 
      borderRight: isLeft ? '2px solid #22120a' : 'none', 
      borderLeft: !isLeft ? '2px solid #22120a' : 'none', 
      position: 'relative', display: 'flex', flexDirection: 'column', 
      justifyContent: 'flex-start', alignItems: 'center',
      paddingTop: '6px',
      backgroundColor: '#5c3e28'
    }}>
      {/* Ô kính vuông nhỏ trên cửa */}
      <div style={{ 
        width: '20px', height: '20px', backgroundColor: '#6ba7d1', 
        border: '3px solid #362214', borderRadius: '4px', position: 'relative', overflow: 'hidden',
        boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4)' 
      }}>
        {/* Khung chia ô kính chữ thập */}
        <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: '2px', backgroundColor: '#362214' }} />
        <div style={{ position: 'absolute', top: 0, left: '50%', width: '2px', height: '100%', backgroundColor: '#362214' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, transparent 60%)' }} />
      </div>
      
      {/* Panel gỗ dập nổi bên dưới */}
      <div style={{ 
        marginTop: '6px', width: '20px', height: '18px', backgroundColor: '#4a2f1d', 
        border: '2px solid #362214', borderRadius: '3px',
        boxShadow: 'inset 0 2px 2px rgba(0,0,0,0.2), 0 1px 0 rgba(255,255,255,0.1)'
      }} />

      {/* Tay nắm cửa kim loại đồng */}
      <div style={{ 
        position: 'absolute', [isLeft ? 'right' : 'left']: '5px', top: '50%', 
        width: '4px', height: '12px', backgroundColor: '#eab308', borderRadius: '2px', 
        boxShadow: '1px 1px 2px rgba(0,0,0,0.5)',
      }}>
      </div>
    </div>
  );
}

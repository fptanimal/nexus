import React from 'react';

export default function HospitalBuilding() {
  return (
    <div 
      className="origin-bottom-left"
      style={{ 
        width: '288px', 
        height: '224px',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        position: 'absolute'
      }}
    >
      {/* Tầng mái phẳng (Pixel Style) */}
      <div 
        style={{
          width: '84%',
          height: '24px',
          backgroundColor: '#94a3b8', // Xám
          border: '4px solid #1e293b', // Viền đen đậm
          borderBottom: 'none',
          borderRadius: '16px 16px 0 0',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 11,
          boxShadow: 'inset 0 -8px 0 rgba(0,0,0,0.2)' // Bóng khối
        }}
      >
        {/* Thiết bị trên mái (Cục nóng điều hòa blocky) */}
        <div style={{ position: 'absolute', bottom: '0', right: '24px', width: '28px', height: '16px', backgroundColor: '#cbd5e1', border: '4px solid #1e293b', borderBottom: 'none' }}>
           <div style={{ width: '100%', height: '4px', backgroundColor: '#64748b', marginTop: '2px' }} />
           <div style={{ width: '100%', height: '4px', backgroundColor: '#64748b', marginTop: '2px' }} />
        </div>
      </div>

      {/* Biển hiệu chữ thập Pixel */}
      <div style={{
          position: 'absolute',
          top: '8px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '48px',
          height: '48px',
          backgroundColor: '#f8fafc',
          border: '4px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 15,
          boxShadow: '0 8px 0 rgba(0,0,0,0.2)'
        }}>
          {/* Chữ thập blocky */}
          <div style={{ position: 'absolute', width: '24px', height: '8px', backgroundColor: '#ef4444', border: '2px solid #7f1d1d' }} />
          <div style={{ position: 'absolute', width: '8px', height: '24px', backgroundColor: '#ef4444', border: '2px solid #7f1d1d' }} />
      </div>

      {/* Tường chính */}
      <div 
        style={{
          width: '100%',
          height: '200px',
          backgroundColor: '#e2e8f0', // Trắng xám
          border: '4px solid #1e293b',
          borderBottom: '4px solid #0f172a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          borderRadius: '0 0 16px 16px',
          boxShadow: 'inset -20px 0 0 rgba(0,0,0,0.1), inset 0 20px 0 rgba(255,255,255,0.4)', // Đổ bóng tạo khối
          // Pattern gạch / tấm ốp pixel
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.03) 2px, transparent 2px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.03) 2px, transparent 2px)
          `,
          backgroundSize: '32px 32px'
        }}
      >
        {/* Dải phân cách xanh y tế (Solid, no gradient) */}
        <div style={{ position: 'absolute', top: '40px', left: 0, width: '100%', height: '8px', backgroundColor: '#3b82f6', borderTop: '2px solid #60a5fa', borderBottom: '2px solid #1d4ed8' }} />
        <div style={{ position: 'absolute', top: '112px', left: 0, width: '100%', height: '8px', backgroundColor: '#3b82f6', borderTop: '2px solid #60a5fa', borderBottom: '2px solid #1d4ed8' }} />

        {/* Cửa sổ vuông vức (Tầng 2) */}
        <div style={{ display: 'flex', gap: '24px', marginTop: '56px', zIndex: 5 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ width: '44px', height: '40px', backgroundColor: '#0284c7', border: '4px solid #1e293b', borderRadius: '12px', position: 'relative', boxShadow: 'inset 4px 4px 0 rgba(0,0,0,0.3)' }}>
                  {/* Vệt phản quang pixel */}
                  <div style={{ position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px', backgroundColor: '#bae6fd' }} />
                  <div style={{ position: 'absolute', top: '16px', right: '4px', width: '8px', height: '4px', backgroundColor: '#bae6fd' }} />
                  <div style={{ position: 'absolute', top: '4px', right: '16px', width: '4px', height: '8px', backgroundColor: '#bae6fd' }} />
              </div>
            ))}
        </div>

        {/* Cửa sổ vuông vức (Tầng 1) */}
        <div style={{ display: 'flex', gap: '24px', marginTop: '32px', zIndex: 5, paddingLeft: '48px' }}>
            {[1, 2].map(i => (
              <div key={i} style={{ width: '44px', height: '40px', backgroundColor: '#0284c7', border: '4px solid #1e293b', borderRadius: '12px', position: 'relative', boxShadow: 'inset 4px 4px 0 rgba(0,0,0,0.3)' }}>
                  {/* Vệt phản quang pixel */}
                  <div style={{ position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px', backgroundColor: '#bae6fd' }} />
                  <div style={{ position: 'absolute', top: '16px', right: '4px', width: '8px', height: '4px', backgroundColor: '#bae6fd' }} />
                  <div style={{ position: 'absolute', top: '4px', right: '16px', width: '4px', height: '8px', backgroundColor: '#bae6fd' }} />
              </div>
            ))}
        </div>

        {/* Cửa hông bên trái (Side Entrance) - KHÔNG VÀO ĐƯỢC */}
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '-4px', // Lùi ra viền
          width: '64px',
          height: '64px',
          backgroundColor: '#cbd5e1',
          border: '4px solid #1e293b',
          borderBottom: 'none',
          borderRadius: '16px 16px 0 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: '4px'
        }}>
           {/* Mái bạt che trên cửa (Awning) kiểu sọc */}
           <div style={{ 
             position: 'absolute', 
             top: '-12px', left: '-8px', 
             width: '80px', height: '16px', 
             backgroundColor: '#ef4444', 
             border: '4px solid #1e293b',
             backgroundImage: 'repeating-linear-gradient(to right, transparent, transparent 8px, #b91c1c 8px, #b91c1c 16px)'
            }} />

           {/* Cửa cuốn đang đóng (Biểu thị Không Vào Được) */}
           <div style={{ 
             width: '40px', height: '44px', 
             backgroundColor: '#64748b', 
             border: '4px solid #334155',
             borderRadius: '8px 8px 0 0',
             backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 4px, #475569 4px, #475569 8px)',
             boxShadow: 'inset 0 12px 12px rgba(0,0,0,0.4)'
            }}>
                {/* Dấu chéo / Bảng Close pixel */}
                <div style={{ position: 'absolute', bottom: '16px', left: '16px', backgroundColor: '#ef4444', border: '2px solid #7f1d1d', padding: '2px 4px', fontSize: '8px', color: 'white', fontWeight: 'bold' }}>
                    CLOSED
                </div>
            </div>
        </div>

        {/* Hộp cứu hỏa / Tiện ích nhỏ ngoài tường */}
        <div style={{ position: 'absolute', bottom: '24px', right: '32px', width: '16px', height: '24px', backgroundColor: '#ef4444', border: '4px solid #1e293b' }}>
           <div style={{ width: '4px', height: '4px', backgroundColor: 'white', margin: '2px' }} />
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

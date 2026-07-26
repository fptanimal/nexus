import React from 'react';
import useGameStore from '../store/useGameStore';

export default function SchoolOverlay() {
  const currentLocation = useGameStore(state => state.currentLocation);
  
  if (currentLocation !== 'main') return null;

  return (
    <div 
      className="absolute"
      style={{
        left: '576px', // Cột 18
        top: '128px', // Hàng 4
        width: '288px', // 9 ô
        height: '224px', // 7 ô
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        position: 'absolute',
        imageRendering: 'pixelated'
      }}
    >
      {/* CLOCK TOWER */}
      <div style={{ 
        position: 'absolute', top: '-86px', width: '80px', 
        display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 9 
      }}>
        {/* Mái vòm xanh tháp đồng hồ (Smooth Curve) */}
        <div style={{ width: '80px', height: '32px', backgroundColor: '#8cc4a4', border: '2px solid #2f2523', borderBottom: 'none', borderRadius: '40px 40px 0 0', position: 'relative', overflow: 'hidden' }}>
           {/* Các đường rãnh ngói xanh */}
           <div style={{ position: 'absolute', bottom: '0', left: '20px', width: '2px', height: '24px', backgroundColor: '#2f2523' }} />
           <div style={{ position: 'absolute', bottom: '0', right: '20px', width: '2px', height: '24px', backgroundColor: '#2f2523' }} />
        </div>
        
        {/* Thềm mái xanh */}
        <div style={{ width: '80px', height: '14px', backgroundColor: '#8cc4a4', border: '2px solid #2f2523', position: 'relative', boxShadow: 'inset 0 -4px 0 rgba(0,0,0,0.15)' }}>
           {/* Highlight mỏng trên mép mái */}
           <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', backgroundColor: 'rgba(255,255,255,0.4)' }} />
        </div>
        
        {/* Chuông */}
        <div style={{ width: '64px', height: '32px', backgroundColor: '#d8c8a1', borderLeft: '2px solid #2f2523', borderRight: '2px solid #2f2523', display: 'flex', justifyContent: 'center', position: 'relative', boxShadow: 'inset 0 6px 10px rgba(0,0,0,0.2)' }}>
           {/* Bóng râm phía sau chuông (Smooth Arch) */}
           <div style={{ position: 'absolute', bottom: 0, width: '40px', height: '26px', backgroundColor: '#8e96ab', border: '2px solid #2f2523', borderRadius: '20px 20px 0 0', borderBottom: 'none', display: 'flex', justifyContent: 'center', boxShadow: 'inset 0 8px 12px rgba(0,0,0,0.4)' }}>
              {/* Quả chuông (Smooth) */}
              <div style={{ width: '24px', height: '18px', backgroundColor: '#caa364', borderRadius: '12px 12px 0 0', marginTop: '4px', border: '2px solid #2f2523', position: 'relative', boxShadow: 'inset -4px 0 0 rgba(0,0,0,0.2), inset 2px 0 0 rgba(255,255,255,0.4)' }}>
                 <div style={{ position: 'absolute', bottom: '-4px', left: '8px', width: '4px', height: '4px', backgroundColor: '#2f2523' }} />
                 <div style={{ position: 'absolute', top: '1px', left: '2px', width: '8px', height: '6px', backgroundColor: '#dfbc81', borderRadius: '50%' }} />
              </div>
           </div>
        </div>

        {/* Đồng hồ */}
        <div style={{ width: '76px', height: '48px', backgroundColor: '#d8c8a1', border: '2px solid #2f2523', borderBottom: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
           {/* Gạch góc tháp đồng hồ */}
           <div style={{ position: 'absolute', left: '2px', width: '8px', height: '100%', backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 10px, #2f2523 10px, #2f2523 12px)' }} />
           <div style={{ position: 'absolute', right: '2px', width: '8px', height: '100%', backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 10px, #2f2523 10px, #2f2523 12px)' }} />
           <div style={{ position: 'absolute', left: '10px', width: '2px', height: '100%', backgroundColor: '#2f2523' }} />
           <div style={{ position: 'absolute', right: '10px', width: '2px', height: '100%', backgroundColor: '#2f2523' }} />

           {/* Smooth Clock Face */}
           <div style={{ width: '36px', height: '36px', backgroundColor: '#ffffff', borderRadius: '50%', border: '2px solid #2f2523', position: 'relative', zIndex: 2 }}>
              {/* Vạch số */}
              <div style={{ position: 'absolute', top: '2px', left: '15px', width: '2px', height: '4px', backgroundColor: '#2f2523' }} />
              <div style={{ position: 'absolute', bottom: '2px', left: '15px', width: '2px', height: '4px', backgroundColor: '#2f2523' }} />
              <div style={{ position: 'absolute', top: '15px', left: '2px', width: '4px', height: '2px', backgroundColor: '#2f2523' }} />
              <div style={{ position: 'absolute', top: '15px', right: '2px', width: '4px', height: '2px', backgroundColor: '#2f2523' }} />
              
              {/* Kim đồng hồ */}
              <div style={{ position: 'absolute', top: '6px', left: '15px', width: '2px', height: '10px', backgroundColor: '#2f2523', transformOrigin: 'bottom center', transform: 'rotate(45deg)' }} />
              <div style={{ position: 'absolute', top: '16px', left: '15px', width: '8px', height: '2px', backgroundColor: '#2f2523' }} />
              <div style={{ position: 'absolute', top: '15px', left: '15px', width: '4px', height: '4px', backgroundColor: '#2f2523', borderRadius: '50%' }} />
           </div>
        </div>
      </div>

      {/* MÁI NHÀ ĐỎ (Smooth Rounded Corners) */}
      <div 
        style={{
          width: '100%',
          height: '64px',
          backgroundColor: '#af4640', 
          border: '2px solid #2f2523',
          borderBottom: '4px solid #2f2523',
          borderRadius: '16px 16px 0 0',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 11,
          backgroundImage: `
            repeating-linear-gradient(to right, transparent, transparent 28px, #2f2523 28px, #2f2523 30px),
            repeating-linear-gradient(to bottom, transparent, transparent 20px, #2f2523 20px, #2f2523 22px)
          `,
          boxShadow: 'inset 0 16px 20px rgba(255,255,255,0.15), inset 0 -8px 10px rgba(0,0,0,0.2)'
        }}
      >
         {/* Highlight ngói trên cùng */}
         <div style={{ position: 'absolute', top: '2px', left: '8px', width: 'calc(100% - 16px)', height: '2px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '10px' }} />
      </div>

      {/* TƯỜNG CHÍNH (Main Wall) */}
      <div 
        style={{
          width: '96%',
          height: '160px',
          backgroundColor: '#decca7',
          border: '2px solid #2f2523',
          borderTop: 'none',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          borderRadius: '0 0 16px 16px',
          boxShadow: 'inset 0 12px 12px rgba(0,0,0,0.15)' // Bóng đổ từ mái nhà xuống tường
        }}
      >
        {/* Bóng nền bên dưới (Shadow gradient) */}
        <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '32px', backgroundColor: '#bda881', zIndex: 1, borderTop: '2px solid rgba(47,37,35,0.2)' }} />

        {/* Viền gạch hai bên (Side bricks) */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '16px', backgroundColor: '#bda881', borderRight: '2px solid #2f2523', backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 15px, #2f2523 15px, #2f2523 17px)' }} />
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '16px', backgroundColor: '#bda881', borderLeft: '2px solid #2f2523', backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 15px, #2f2523 15px, #2f2523 17px)' }} />

        {/* Bảng hiệu (Sign) */}
        <div style={{
          marginTop: '16px',
          backgroundColor: '#f7ecdc',
          padding: '6px 32px',
          border: '2px solid #2f2523',
          borderRadius: '12px',
          color: '#4a3e35',
          fontFamily: 'var(--font-sans)',
          fontSize: '18px',
          fontWeight: '900',
          letterSpacing: '2px',
          zIndex: 2,
          boxShadow: '0 4px 0 rgba(0,0,0,0.1)'
        }}>
          HIGH SCHOOL
        </div>

        {/* Cửa sổ trái */}
        <div style={{ position: 'absolute', left: '26px', top: '70px', zIndex: 2 }}>
           {createRetroWindow()}
        </div>

        {/* Cửa sổ phải */}
        <div style={{ position: 'absolute', right: '26px', top: '70px', zIndex: 2 }}>
           {createRetroWindow()}
        </div>

        {/* Cửa chính (Double Doors) */}
        <div style={{
          position: 'absolute',
          bottom: '0',
          width: '96px',
          height: '76px',
          backgroundColor: '#4c3b31',
          border: '2px solid #2f2523',
          borderBottom: 'none',
          borderRadius: '16px 16px 0 0',
          display: 'flex',
          zIndex: 3
        }}>
          {createRetroDoor('left')}
          {createRetroDoor('right')}
        </div>
      </div>
    </div>
  );
}

function createRetroWindow() {
  return (
    <div style={{
      width: '56px', height: '48px', 
      backgroundColor: '#ffffff', // Khung trắng
      border: '2px solid #2f2523',
      borderRadius: '12px',
      padding: '4px',
      boxShadow: '0 4px 0 rgba(0,0,0,0.15), inset 0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{
         width: '100%', height: '100%',
         backgroundColor: '#6ac3e2', // Kính xanh
         border: '2px solid #2f2523',
         borderRadius: '8px',
         position: 'relative',
         boxShadow: 'inset 0 8px 12px rgba(0,0,0,0.2)' // Bóng râm góc trên kính
      }}>
         {/* Khung chữ thập trắng bên trong */}
         <div style={{ position: 'absolute', left: '50%', top: 0, width: '2px', height: '100%', backgroundColor: '#ffffff', transform: 'translateX(-1px)', zIndex: 2 }} />
         <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: '2px', backgroundColor: '#ffffff', transform: 'translateY(-1px)', zIndex: 2 }} />
         
         {/* Vệt phản chiếu ánh sáng (Glare) */}
         <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '150%', height: '150%', background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 40%)', pointerEvents: 'none', zIndex: 1 }} />
      </div>
    </div>
  );
}

function createRetroDoor(side) {
  const isLeft = side === 'left';
  return (
    <div style={{ 
      flex: 1, 
      backgroundColor: isLeft ? '#4c3b31' : '#42332a', // Cửa phải tối màu hơn xíu tạo 3D
      borderRight: isLeft ? '2px solid #2f2523' : 'none', 
      borderRadius: isLeft ? '14px 0 0 0' : '0 14px 0 0',
      position: 'relative',
      boxShadow: isLeft ? 'inset 4px 0 8px rgba(255,255,255,0.05)' : 'inset -4px 0 8px rgba(0,0,0,0.1)'
    }}>
      {/* Bản lề sắt (Iron hinges) - Trên */}
      <div style={{ position: 'absolute', top: '12px', [isLeft ? 'right' : 'left']: '0', width: '24px', height: '4px', backgroundColor: '#2f2523' }}>
         <div style={{ position: 'absolute', top: '-4px', [isLeft ? 'left' : 'right']: '2px', width: '8px', height: '12px', border: '2px solid #2f2523', borderRadius: '4px', borderRight: isLeft ? 'none' : '2px solid #2f2523', borderLeft: !isLeft ? 'none' : '2px solid #2f2523' }} />
      </div>
      
      {/* Bản lề sắt (Iron hinges) - Dưới */}
      <div style={{ position: 'absolute', bottom: '12px', [isLeft ? 'right' : 'left']: '0', width: '24px', height: '4px', backgroundColor: '#2f2523' }}>
         <div style={{ position: 'absolute', top: '-4px', [isLeft ? 'left' : 'right']: '2px', width: '8px', height: '12px', border: '2px solid #2f2523', borderRadius: '4px', borderRight: isLeft ? 'none' : '2px solid #2f2523', borderLeft: !isLeft ? 'none' : '2px solid #2f2523' }} />
      </div>

      {/* Tay nắm cửa (Handle) */}
      <div style={{ 
         position: 'absolute', top: '40%', [isLeft ? 'right' : 'left']: '6px',
         width: '6px', height: '14px', border: '2px solid #2f2523', borderRadius: '2px',
         borderRight: isLeft ? 'none' : '2px solid #2f2523',
         borderLeft: !isLeft ? 'none' : '2px solid #2f2523'
      }} />
      <div style={{ 
         position: 'absolute', top: '48%', [isLeft ? 'right' : 'left']: '4px',
         width: '8px', height: '4px', backgroundColor: '#2f2523'
      }} />
    </div>
  );
}

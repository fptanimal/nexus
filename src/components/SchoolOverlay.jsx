import React from 'react';
import useGameStore from '../store/useGameStore';
import schoolImg from '../assets/high_school_building.png';

export default function SchoolOverlay() {
  const currentLocation = useGameStore(state => state.currentLocation);
  
  if (currentLocation !== 'main') return null;

  return (
    <div 
      className="absolute"
      style={{
        left: '576px', // Cột 18
        top: '73px', // Giữ cho mép dưới nằm đúng ở px thứ 352 (bắt đầu hàng 11)
        width: '288px', // Kéo dài từ cột 18 đến 26 (9 ô)
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        position: 'absolute'
      }}
    >
      <img 
        src={schoolImg} 
        alt="High School"
        style={{
          width: '100%',
          height: 'auto',
          imageRendering: 'pixelated'
        }}
      />
    </div>
  );
}

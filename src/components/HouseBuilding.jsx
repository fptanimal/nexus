import React from 'react';
import houseImg from '../assets/overload_house.png';

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
      <img 
        src={houseImg} 
        alt="House"
        style={{
          width: '100%',
          height: 'auto',
          imageRendering: 'pixelated'
        }}
      />
    </div>
  );
}

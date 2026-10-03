import React from 'react';
import libraryImg from '../assets/library_final.png';

export default function LibraryBuilding() {
  return (
    <div 
      className="origin-bottom-left"
      style={{ 
        width: '288px', 
        height: '288px',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        position: 'absolute'
      }}
    >
      <img 
        src={libraryImg} 
        alt="Library"
        style={{
          width: '100%',
          height: 'auto',
          imageRendering: 'pixelated'
        }}
      />
    </div>
  );
}

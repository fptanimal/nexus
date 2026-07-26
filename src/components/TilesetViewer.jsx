import React from 'react';

const TilesetViewer = () => {
  const gridSize = 32;

  // Let's create a huge grid of 20x20
  const gridCells = [];
  for (let y = 0; y < 20; y++) {
    for (let x = 0; x < 20; x++) {
      gridCells.push(
        <div
          key={`${x}-${y}`}
          style={{
            position: 'absolute',
            left: x * gridSize,
            top: y * gridSize,
            width: gridSize,
            height: gridSize,
            border: '1px solid rgba(255,255,255,0.5)',
            color: 'white',
            fontSize: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.1)'
          }}
        >
          {x},{y}
        </div>
      );
    }
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, backgroundColor: '#333', padding: 20, overflow: 'auto', width: '100vw', height: '100vh' }}>
      <h2 style={{ color: 'white' }}>DEBUG: Tọa độ Tileset (Sếp đọc tọa độ cho tôi nhé!)</h2>
      <p style={{ color: 'yellow' }}>Ghi chú: Lưới đang chia theo 32x32 pixel. Sếp tìm cái Giường, Bàn, Tủ sách... xem nó chiếm các ô (X,Y) nào rồi nhắn tôi nhé!</p>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <img src="/tileset.png" alt="Tileset" style={{ display: 'block' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {gridCells}
        </div>
      </div>
    </div>
  );
};

export default TilesetViewer;

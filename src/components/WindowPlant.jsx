import React, { useEffect } from 'react';
import useGameStore from '../store/useGameStore';
import audioSystem from '../utils/audioSystem';

// Chậu cây cửa sổ — không mục tiêu, không phần thưởng
// Chỉ một chi tiết nhỏ cho bạn thấy tình trạng của mình
export default function WindowPlant() {
  const plantHealth = useGameStore(state => state.plantHealth);
  const plantWatered = useGameStore(state => state.plantWatered);
  const waterPlant = useGameStore(state => state.waterPlant);
  const tickPlant = useGameStore(state => state.tickPlant);
  const stress = useGameStore(state => state.stress);
  const currentLocation = useGameStore(state => state.currentLocation);

  // Plant wilts over time
  useEffect(() => {
    const interval = setInterval(() => {
      tickPlant();
    }, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [tickPlant]);

  // Only show in bedroom
  if (currentLocation !== 'bedroom') return null;

  // Visual states based on health
  const getPlantEmoji = () => {
    if (plantHealth > 80) return '🌿';
    if (plantHealth > 60) return '🌱';
    if (plantHealth > 30) return '🥀';
    if (plantHealth > 0) return '🍂';
    return '💀';
  };

  const getPlantColor = () => {
    if (plantHealth > 60) return 'var(--color-energy)';
    if (plantHealth > 30) return 'var(--color-academics)';
    return 'var(--color-stress)';
  };

  return (
    <div className="absolute top-3 left-3 z-40">
      <button
        onClick={() => { audioSystem.playChime(); waterPlant(); }}
        disabled={plantWatered}
        className="group relative flex flex-col items-center transition-all"
        style={{
          background: 'var(--color-bg-base)',
          border: `1px solid ${plantWatered ? 'var(--color-border)' : 'var(--color-border-light)'}`,
          padding: '8px 12px',
          borderRadius: '2px',
          cursor: plantWatered ? 'default' : 'pointer',
          opacity: plantWatered ? 0.7 : 1,
          boxShadow: `0 0 ${plantHealth > 60 ? '8px' : '0'} ${getPlantColor()}30`
        }}
        title={plantWatered ? 'Đã tưới hôm nay' : 'Tưới cây'}
      >
        {/* Plant */}
        <span style={{ 
          fontSize: '20px', 
          filter: plantHealth < 30 ? 'grayscale(0.5)' : 'none',
          transition: 'filter 0.5s'
        }}>
          {getPlantEmoji()}
        </span>
        
        {/* Health bar (subtle) */}
        <div style={{
          width: '32px', height: '2px', marginTop: '4px',
          background: 'var(--color-bg-deep)',
          borderRadius: '1px', overflow: 'hidden'
        }}>
          <div style={{
            width: `${plantHealth}%`,
            height: '100%',
            background: getPlantColor(),
            transition: 'width 1s, background 1s'
          }} />
        </div>

        {/* Water prompt */}
        {!plantWatered && (
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ fontSize: '8px', color: 'var(--color-cyan)' }}>
            💧 Tưới
          </span>
        )}
      </button>
    </div>
  );
}

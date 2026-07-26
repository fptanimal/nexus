import React, { useState } from 'react';
import { Volume2, VolumeX, Music, Speaker } from 'lucide-react';
import useGameStore from '../store/useGameStore';
import audioSystem from '../utils/audioSystem';

export default function SoundController() {
  const soundEnabled = useGameStore(state => state.soundEnabled);
  const bgmVolume = useGameStore(state => state.bgmVolume);
  const sfxVolume = useGameStore(state => state.sfxVolume);
  const toggleSound = useGameStore(state => state.toggleSound);
  const setBgmVolume = useGameStore(state => state.setBgmVolume);
  const setSfxVolume = useGameStore(state => state.setSfxVolume);
  const nextTrack = useGameStore(state => state.nextTrack);
  const prevTrack = useGameStore(state => state.prevTrack);

  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => {
    audioSystem.playClick();
    toggleSound();
  };

  return (
    <div className="sidebar-section">
      <div className="flex items-center justify-between mb-1.5">
        <span className="sidebar-label" style={{ marginBottom: 0 }}>Âm thanh 8-Bit</span>
        <button 
          onClick={handleToggle}
          className="p-1 rounded transition-colors"
          style={{ 
            background: soundEnabled ? 'var(--color-bg-deep)' : 'hsl(0 60% 30% / 0.5)',
            border: '1px solid var(--color-border)',
            color: soundEnabled ? 'var(--color-accent)' : 'var(--color-text-muted)'
          }}
          title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
        >
          {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
        </button>
      </div>

      {soundEnabled && (
        <div className="flex flex-col gap-2 mt-2 px-1 py-1.5 rounded"
             style={{ background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)' }}>
          
          {/* BGM Controls */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-secondary)', fontSize: '10px' }}>
              <Music size={11} />
              <span>Nhạc</span>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={prevTrack} 
                className="px-1 text-[10px] bg-[var(--color-bg-dark)] rounded hover:bg-[var(--color-border)]"
                title="Bài trước"
              >
                ◀
              </button>
              <button 
                onClick={nextTrack} 
                className="px-1 text-[10px] bg-[var(--color-bg-dark)] rounded hover:bg-[var(--color-border)]"
                title="Bài tiếp"
              >
                ▶
              </button>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05"
              value={bgmVolume}
              onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
              className="w-12 accent-[var(--color-accent)] h-1.5 rounded cursor-pointer"
            />
          </div>

          {/* SFX Slider */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-secondary)', fontSize: '10px' }}>
              <Speaker size={11} />
              <span>Hiệu ứng</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05"
              value={sfxVolume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setSfxVolume(val);
                audioSystem.playClick();
              }}
              className="w-16 accent-[var(--color-energy)] h-1.5 rounded cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
}

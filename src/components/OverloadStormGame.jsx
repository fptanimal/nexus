import React, { useState, useEffect, useRef } from 'react';
import useGameStore from '../store/useGameStore';
import audioSystem from '../utils/audioSystem';

const THOUGHTS = [
  "Quá ồn ào...",
  "Không ai hiểu mình",
  "Khó thở quá",
  "Mọi thứ đang sụp đổ",
  "Mình làm sai rồi",
  "Đừng nhìn tôi",
  "Mệt mỏi",
  "Trống rỗng",
  "Vô dụng"
];

export default function OverloadStormGame({ onWin, onFail }) {
  const [timeLeft, setTimeLeft] = useState(10);
  const [anchorPos, setAnchorPos] = useState({ x: 50, y: 50 });
  const [thoughts, setThoughts] = useState([]);

  useEffect(() => {
    // Generate flying thoughts
    const newThoughts = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      text: THOUGHTS[Math.floor(Math.random() * THOUGHTS.length)],
      top: Math.random() * 90 + '%',
      left: Math.random() * 90 + '%',
      animationDuration: (Math.random() * 3 + 2) + 's',
      fontSize: (Math.random() * 20 + 12) + 'px',
      opacity: Math.random() * 0.5 + 0.2
    }));
    setThoughts(newThoughts);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onFail();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Move anchor randomly every 1.5s
    const mover = setInterval(() => {
      setAnchorPos({
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10
      });
    }, 1500);

    return () => {
      clearInterval(timer);
      clearInterval(mover);
    };
  }, [onFail]);

  const handleAnchorClick = () => {
    audioSystem.playChime();
    onWin();
  };

  return (
    <div className="absolute inset-0 z-50 overflow-hidden" style={{ background: 'rgba(0,0,0,0.85)', pointerEvents: 'auto' }}>
      
      {/* Glitching thoughts */}
      {thoughts.map(t => (
        <div key={t.id} 
             className="absolute whitespace-nowrap text-red-500 font-pixel chromatic-aberration"
             style={{
               top: t.top,
               left: t.left,
               fontSize: t.fontSize,
               opacity: t.opacity,
               animation: `glitch-heavy ${t.animationDuration} linear infinite alternate`
             }}>
          {t.text}
        </div>
      ))}

      {/* Instruction & Timer */}
      <div className="absolute top-10 w-full text-center z-10 pointer-events-none">
        <h2 className="font-pixel text-white chromatic-aberration" style={{ fontSize: '24px' }}>
          TÌM ĐIỂM NEO!
        </h2>
        <p className="font-mono text-red-400 mt-2" style={{ fontSize: '18px' }}>
          00:{timeLeft.toString().padStart(2, '0')}
        </p>
      </div>

      {/* Anchor Point */}
      <button 
        onClick={handleAnchorClick}
        className="absolute w-12 h-12 flex items-center justify-center rounded-full transition-all duration-700 ease-in-out cursor-pointer"
        style={{
          top: `${anchorPos.y}%`,
          left: `${anchorPos.x}%`,
          transform: 'translate(-50%, -50%)',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '2px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 0 15px rgba(255, 255, 255, 0.3)'
        }}
      >
        <span className="text-white opacity-80 font-pixel" style={{ fontSize: '10px' }}>NEO</span>
      </button>
    </div>
  );
}

import React, { useState } from 'react';
import useGameStore from '../store/useGameStore';
import audioSystem from '../utils/audioSystem';

export default function IntrusiveThought() {
  const intrusiveThought = useGameStore(state => state.intrusiveThought);
  const clearIntrusiveThought = useGameStore(state => state.clearIntrusiveThought);
  const increaseStress = useGameStore(state => state.increaseStress);
  const decreaseStress = useGameStore(state => state.decreaseStress);
  
  const [size, setSize] = useState(1); // 1 = normal, >1 = bigger
  const [isLeaving, setIsLeaving] = useState(false);
  
  if (!intrusiveThought && !isLeaving) return null;

  const handleChoice = (type) => {
    audioSystem.playClick();
    
    if (type === 'ignore') {
      // Phớt lờ: Nó không đi hẳn, tốn ít stress
      increaseStress(10);
      setIsLeaving(true);
      setTimeout(() => {
        clearIntrusiveThought();
        setIsLeaving(false);
      }, 500);
    } else if (type === 'fight') {
      // Cãi cực đoan: Nó to lên
      setSize(s => s + 0.5);
      increaseStress(20);
    } else if (type === 'cbt') {
      // Phản biện CBT cân bằng: Nó xẹp xuống và bỏ đi
      setSize(0.5);
      decreaseStress(10);
      // Play a deflate sound if possible
      setTimeout(() => {
        setIsLeaving(true);
        setTimeout(() => {
          clearIntrusiveThought();
          setSize(1);
          setIsLeaving(false);
        }, 500);
      }, 800);
    }
  };

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-auto" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className={`p-6 bg-[#2a2a35] border-4 border-[#1a1a24] shadow-[0_0_20px_rgba(0,0,0,0.8)] flex flex-col items-center transition-all duration-300 ${isLeaving ? 'opacity-0 scale-50' : 'opacity-100'}`}
           style={{ transform: `scale(${isLeaving ? 0.5 : 1})`, width: '400px' }}>
        
        {/* Creature graphic */}
        <div className="mb-4 transition-transform duration-500 ease-in-out" style={{ transform: `scale(${size})` }}>
          <div className="w-20 h-20 rounded-full bg-purple-900 flex items-center justify-center border-2 border-purple-500 relative animate-pulse">
            <span className="text-4xl filter drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]">👁️</span>
            {/* Sparkles of anxiety */}
            <div className="absolute -top-2 -right-2 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
            <div className="absolute -bottom-1 -left-2 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>

        {/* Creature Name */}
        <h3 className="text-purple-400 font-pixel text-[10px] mb-2">{intrusiveThought?.name || "Bà Tiên Tri"}</h3>
        
        {/* Thought Text */}
        <p className="text-white text-sm mb-6 text-center italic">
          "{intrusiveThought?.text}"
        </p>

        {/* Choices */}
        <div className="flex flex-col gap-2 w-full">
          {intrusiveThought?.options?.map((opt, idx) => (
            <button 
              key={idx}
              onClick={() => handleChoice(opt.type)}
              className="rpg-btn w-full hover:bg-purple-900/30 hover:border-purple-500 transition-colors"
            >
              {opt.label}
            </button>
          ))}
        </div>
        
      </div>
    </div>
  );
}

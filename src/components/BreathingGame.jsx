import React, { useState, useEffect, useRef } from 'react';
import useGameStore from '../store/useGameStore';
import audioSystem from '../utils/audioSystem';

const PHASES = [
  { name: 'HÍT VÀO', duration: 4, color: 'hsl(185 75% 55%)', instruction: 'Hít vào từ từ qua mũi...' },
  { name: 'GIỮ', duration: 7, color: 'hsl(45 90% 55%)', instruction: 'Giữ hơi thở... cậu đang làm tốt lắm.' },
  { name: 'THỞ RA', duration: 8, color: 'hsl(265 70% 65%)', instruction: 'Thở ra thật chậm qua miệng...' },
];

export default function BreathingGame({ onClose }) {
  const breathe = useGameStore(state => state.breathe);
  const addJournalEntry = useGameStore(state => state.addJournalEntry);

  const [currentPhase, setCurrentPhase] = useState(0);
  const [countdown, setCountdown] = useState(PHASES[0].duration);
  const [cyclesLeft, setCyclesLeft] = useState(3);
  const [isActive, setIsActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef(null);

  const phase = PHASES[currentPhase];
  const totalDuration = phase.duration;
  const progress = ((totalDuration - countdown) / totalDuration) * 100;

  const circleScale = currentPhase === 0 
    ? 0.6 + (progress / 100) * 0.4 
    : currentPhase === 1 ? 1 
    : 1 - (progress / 100) * 0.4;

  useEffect(() => {
    if (!isActive) return;

    intervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          const nextPhase = currentPhase + 1;
          if (nextPhase >= PHASES.length) {
            const remaining = cyclesLeft - 1;
            setCyclesLeft(remaining);
            if (remaining <= 0) {
              setIsActive(false);
              setIsComplete(true);
              audioSystem.playChime();
              breathe();
              addJournalEntry('Tôi đã hoàn thành bài tập thở 4-7-8. Cảm thấy dễ chịu hơn.');
              clearInterval(intervalRef.current);
              return 0;
            }
            audioSystem.playStep();
            setCurrentPhase(0);
            return PHASES[0].duration;
          } else {
            audioSystem.playStep();
            setCurrentPhase(nextPhase);
            return PHASES[nextPhase].duration;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isActive, currentPhase, cyclesLeft, breathe, addJournalEntry]);

  const startExercise = () => {
    setIsActive(true);
    setCurrentPhase(0);
    setCountdown(PHASES[0].duration);
    setCyclesLeft(3);
    setIsComplete(false);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
      <div className="modal-overlay absolute inset-0" onClick={onClose}></div>

      <div className="modal-content relative w-full max-w-sm p-8 flex flex-col items-center fade-in" style={{ borderRadius: '4px' }}>
        <button onClick={onClose} className="absolute top-3 right-4 font-pixel transition-colors"
          style={{ fontSize: '8px', color: 'var(--color-text-muted)' }}>✕</button>

        <span className="mb-3" style={{ fontSize: '28px' }}>🫁</span>
        <h2 className="font-pixel text-glow-accent mb-1" 
          style={{ fontSize: '12px', color: 'var(--color-accent)', letterSpacing: '0.15em' }}>
          THỞ 4-7-8
        </h2>
        <p style={{ fontSize: '10px', color: 'var(--color-text-muted)' }} className="mb-6">
          Kỹ thuật giảm lo âu — Dr. Andrew Weil
        </p>

        {!isActive && !isComplete && (
          <div className="flex flex-col items-center gap-5">
            <div className="flex items-center justify-center"
              style={{ 
                width: '100px', height: '100px', borderRadius: '50%',
                border: '2px dashed var(--color-border-light)'
              }}>
              <span style={{ fontSize: '36px' }}>🫁</span>
            </div>
            <p className="text-center" style={{ fontSize: '11px', color: 'var(--color-text-secondary)', maxWidth: '240px' }}>
              Hít vào 4 giây, giữ 7 giây, thở ra 8 giây. Lặp lại 3 lần.
            </p>
            <button onClick={startExercise} className="rpg-btn highlight w-full justify-center"
              style={{ padding: '12px', fontWeight: 600 }}>
              ▸ Bắt đầu
            </button>
          </div>
        )}

        {isActive && (
          <div className="flex flex-col items-center gap-5">
            <div className="relative flex items-center justify-center" style={{ width: '140px', height: '140px' }}>
              {/* Breathing circle */}
              <div className="absolute rounded-full transition-transform"
                style={{ 
                  width: '100%', height: '100%',
                  background: phase.color,
                  opacity: 0.15,
                  transform: `scale(${circleScale})`,
                  transitionDuration: '1s',
                  transitionTimingFunction: 'ease-in-out'
                }} />
              <div className="absolute rounded-full transition-transform"
                style={{ 
                  width: '75%', height: '75%',
                  background: phase.color,
                  opacity: 0.3,
                  transform: `scale(${circleScale})`,
                  transitionDuration: '1s',
                  transitionTimingFunction: 'ease-in-out'
                }} />
              <div className="relative z-10 text-center">
                <p className="font-mono font-bold" style={{ fontSize: '40px', color: 'white' }}>
                  {countdown}
                </p>
                <p className="font-pixel" style={{ fontSize: '7px', color: phase.color, letterSpacing: '0.15em' }}>
                  {phase.name}
                </p>
              </div>
            </div>

            <p className="italic text-center" style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              {phase.instruction}
            </p>
            <p className="font-pixel" style={{ fontSize: '7px', color: 'var(--color-text-muted)' }}>
              Còn {cyclesLeft} vòng
            </p>
          </div>
        )}

        {isComplete && (
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="flex items-center justify-center"
              style={{ 
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'hsl(152 70% 50% / 0.15)',
                border: '2px solid var(--color-energy)'
              }}>
              <span style={{ fontSize: '36px' }}>✨</span>
            </div>
            <div>
              <h3 className="font-pixel text-glow-energy" 
                style={{ fontSize: '10px', color: 'var(--color-energy)', letterSpacing: '0.1em' }}>
                TUYỆT VỜI!
              </h3>
              <p className="mt-2" style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                Stress -15 · Năng lượng +5
              </p>
              <p className="mt-1" style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                Mèo ghi nhận: cậu đang học cách chăm sóc bản thân.
              </p>
            </div>
            <button onClick={onClose} className="rpg-btn w-full justify-center" style={{ padding: '10px' }}>
              Quay lại
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

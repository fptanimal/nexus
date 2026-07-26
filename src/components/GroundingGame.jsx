import React, { useState } from 'react';
import useGameStore from '../store/useGameStore';
import { Eye, Hand, Ear, Wind as Nose, Heart } from 'lucide-react';
import audioSystem from '../utils/audioSystem';

const STEPS = [
  { sense: 'Nhìn', count: 5, icon: Eye, color: 'hsl(185 75% 55%)', prompt: 'Kể 5 thứ cậu NHÌN thấy xung quanh mình ngay bây giờ.' },
  { sense: 'Chạm', count: 4, icon: Hand, color: 'hsl(45 90% 55%)', prompt: 'Kể 4 thứ cậu có thể CHẠM vào / cảm nhận được.' },
  { sense: 'Nghe', count: 3, icon: Ear, color: 'hsl(152 70% 50%)', prompt: 'Kể 3 âm thanh cậu đang NGHE thấy.' },
  { sense: 'Ngửi', count: 2, icon: Nose, color: 'hsl(265 70% 65%)', prompt: 'Kể 2 mùi cậu có thể NGỬI thấy.' },
  { sense: 'Nếm', count: 1, icon: Heart, color: 'hsl(0 75% 60%)', prompt: 'Kể 1 vị cậu có thể NẾM (hoặc tưởng tượng) được.' },
];

export default function GroundingGame({ onClose }) {
  const breathe = useGameStore(state => state.breathe);
  const addJournalEntry = useGameStore(state => state.addJournalEntry);
  
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  const step = STEPS[stepIndex];
  const answersNeeded = step ? step.count : 0;
  const currentStepAnswers = answers.filter(a => a.step === stepIndex);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!currentInput.trim()) return;

    audioSystem.playClick();
    const newAnswers = [...answers, { step: stepIndex, text: currentInput.trim() }];
    setAnswers(newAnswers);
    setCurrentInput('');

    const updatedStepAnswers = newAnswers.filter(a => a.step === stepIndex);
    if (updatedStepAnswers.length >= answersNeeded) {
      if (stepIndex + 1 >= STEPS.length) {
        audioSystem.playChime();
        setIsComplete(true);
        breathe();
        addJournalEntry('Tôi đã hoàn thành bài tập Grounding 5-4-3-2-1. Tôi cảm thấy "ở đây" hơn.');
      } else {
        audioSystem.playStep();
        setStepIndex(stepIndex + 1);
      }
    }
  };

  const Icon = step ? step.icon : Eye;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
      <div className="modal-overlay absolute inset-0" onClick={onClose}></div>

      <div className="modal-content relative w-full max-w-md p-8 flex flex-col items-center fade-in" style={{ borderRadius: '4px' }}>
        <button onClick={onClose} className="absolute top-3 right-4 font-pixel transition-colors"
          style={{ fontSize: '8px', color: 'var(--color-text-muted)' }}>✕</button>

        {/* Progress bar */}
        <div className="w-full flex gap-1 mb-6">
          {STEPS.map((s, i) => (
            <div key={i} className="h-1 flex-1 transition-colors" 
              style={{ 
                background: i < stepIndex 
                  ? 'var(--color-energy)' 
                  : i === stepIndex 
                    ? 'var(--color-text-primary)' 
                    : 'var(--color-border)',
                borderRadius: '1px'
              }} />
          ))}
        </div>

        {!isComplete ? (
          <>
            {/* Step icon */}
            <div className="flex items-center justify-center mb-4"
              style={{ 
                width: '48px', height: '48px', borderRadius: '4px',
                background: `${step.color}15`,
                border: `1px solid ${step.color}40`,
                color: step.color
              }}>
              <Icon size={24} />
            </div>

            <h2 className="font-pixel text-center mb-1" 
              style={{ fontSize: '12px', color: 'var(--color-text-primary)', letterSpacing: '0.1em' }}>
              {step.count} — {step.sense.toUpperCase()}
            </h2>
            <p className="text-center mb-5" style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
              {step.prompt}
            </p>

            {/* Answers */}
            <div className="w-full space-y-1.5 mb-4">
              {currentStepAnswers.map((a, i) => (
                <div key={i} className="px-3 py-2 text-sm"
                  style={{ 
                    background: `${step.color}10`, 
                    border: `1px solid ${step.color}30`,
                    borderRadius: '2px',
                    color: step.color,
                    fontSize: '12px'
                  }}>
                  {a.text}
                </div>
              ))}
              {Array.from({ length: answersNeeded - currentStepAnswers.length }).map((_, i) => (
                <div key={`empty-${i}`} className="px-3 py-2 text-sm"
                  style={{ 
                    border: '1px dashed var(--color-border)',
                    borderRadius: '2px',
                    color: 'var(--color-text-muted)',
                    fontSize: '12px'
                  }}>
                  ...
                </div>
              ))}
            </div>

            <form onSubmit={handleAdd} className="w-full flex gap-2">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder={`Nhập thứ ${currentStepAnswers.length + 1}...`}
                className="flex-1 px-3 py-2.5 text-sm outline-none"
                style={{
                  background: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '2px',
                  color: 'var(--color-text-primary)',
                  fontSize: '12px'
                }}
                autoFocus
              />
              <button type="submit" className="rpg-btn" style={{ padding: '8px 16px', fontWeight: 600 }}>
                Thêm
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center gap-5 text-center py-4">
            <div className="flex items-center justify-center"
              style={{ 
                width: '72px', height: '72px', borderRadius: '50%',
                background: 'hsl(152 70% 50% / 0.15)',
                border: '2px solid var(--color-energy)'
              }}>
              <span style={{ fontSize: '32px' }}>🌱</span>
            </div>
            <div>
              <h3 className="font-pixel text-glow-energy mb-2" 
                style={{ fontSize: '10px', color: 'var(--color-energy)', letterSpacing: '0.1em' }}>
                CẬU ĐÃ QUAY LẠI!
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                Stress -15 · Năng lượng +5
              </p>
              <p className="mt-1" style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                Kỹ thuật Grounding giúp cậu "neo" lại khi cảm xúc cuốn đi quá xa.
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

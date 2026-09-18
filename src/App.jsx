import React, { useState, useEffect } from 'react';
import { Activity, Brain, Users, BookOpen, Heart, Wind, Flower2, BookOpenCheck, Coffee, MessageCircle, MapPin } from 'lucide-react';
import useGameStore, { SCHEDULE } from './store/useGameStore';
import GameCanvas from './components/GameCanvas';
import DialogueBox from './components/DialogueBox';
import JournalModal from './components/JournalModal';
import CatChat from './components/CatChat';
import BreathingGame from './components/BreathingGame';
import GroundingGame from './components/GroundingGame';
import IntrusiveThought from './components/IntrusiveThought';
import TitleScreen from './components/TitleScreen';
import LibraryModal from './components/LibraryModal';
import SchoolModal from './components/SchoolModal';
import HospitalModal from './components/HospitalModal';
import FoodModal from './components/FoodModal';
import SoundController from './components/SoundController';
import TilesetViewer from './components/TilesetViewer';
import OverloadStormGame from './components/OverloadStormGame';
import audioSystem from './utils/audioSystem';
import { initEngine } from './engine/CoreEngine';

export default function App() {
  const isPlaying = useGameStore(state => state.isPlaying);
  const [showTilesetDebug, setShowTilesetDebug] = useState(false);
  
  useEffect(() => {
    initEngine();
    const handleKeyDown = (e) => {
      // Intentionally left blank, T hotkey removed to prevent crash
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (showTilesetDebug) return <TilesetViewer />;

  const startGame = useGameStore(state => state.startGame);
  const timeLimit = useGameStore(state => state.timeLimit);
  const currentLocation = useGameStore(state => state.currentLocation);
  const changeLocation = useGameStore(state => state.changeLocation);
  const endGame = useGameStore(state => state.endGame);
  
  const energy = useGameStore(state => state.energy);
  const stress = useGameStore(state => state.stress);
  const connection = useGameStore(state => state.connection);
  const academics = useGameStore(state => state.academics);
  const authenticity = useGameStore(state => state.authenticity);

  const study = useGameStore(state => state.study);
  const socialize = useGameStore(state => state.socialize);
  const rest = useGameStore(state => state.rest);
  const advanceTime = useGameStore(state => state.advanceTime);
  const addJournalEntry = useGameStore(state => state.addJournalEntry);
  const tickTime = useGameStore(state => state.tickTime);

  const [showBreathing, setShowBreathing] = useState(false);
  const [showGrounding, setShowGrounding] = useState(false);
  const [showOverloadStorm, setShowOverloadStorm] = useState(false);
  const [titleFlicker, setTitleFlicker] = useState(true);
  const [isOverloaded, setIsOverloaded] = useState(false);

  // Real-time ticking logic
  useEffect(() => {
    if (!isPlaying) return;
    
    // Cập nhật thời gian mỗi giây (1000ms)
    const timer = setInterval(() => {
      tickTime();
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, tickTime]);

  useEffect(() => {
    if (isPlaying && !isOverloaded) {
      audioSystem.updateVibe(currentLocation, stress);
    }
  }, [currentLocation, stress, isPlaying, isOverloaded]);

  // Overload state trigger
  useEffect(() => {
    // Chỉ trigger khi stress >= 100 và CHƯA overloaded
    if (isPlaying && stress >= 100 && !isOverloaded) {
      setIsOverloaded(true);
      if (audioSystem.isPlayingBGM) {
        audioSystem.stopBGM();
      }
      if (useGameStore.getState().soundEnabled) {
        audioSystem.startOverloadAudio();
      }
      
      // Mở bão suy nghĩ tiêu cực thay vì bắt thở ngay
      setShowOverloadStorm(true);
      useGameStore.getState().addJournalEntry("Mọi thứ vỡ vụn... Mình không thể thở được. Tiếng ồn ở khắp nơi.");
      useGameStore.getState().addCatMessage('cat', 'T-thở đ...i! Nh-nhìn v-vào tớ n-này!!!');
    }
  }, [stress, isPlaying, isOverloaded]);

  const handleOverloadWin = () => {
    setShowOverloadStorm(false);
    setShowBreathing(true); // Thắng thì được chuyển qua game thở để bình tĩnh
  };

  const handleOverloadFail = () => {
    setShowOverloadStorm(false);
    audioSystem.stopOverloadAudio();
    if (useGameStore.getState().soundEnabled) {
      audioSystem.playError();
      audioSystem.startBGM();
    }
    useGameStore.getState().applyExhaustionDebuff();
    useGameStore.getState().decreaseStress(30); // Giảm một chút để không bị lặp ngay, nhưng bị debuff
    setIsOverloaded(false);
  };

  const handleCloseBreathing = () => {
    setShowBreathing(false);
    if (isOverloaded) {
      useGameStore.getState().decreaseStress(50); // Giảm stress sau khi thở xong
      setIsOverloaded(false);
      audioSystem.stopOverloadAudio();
      if (useGameStore.getState().soundEnabled) {
        audioSystem.startBGM(); // Bật lại nhạc
      }
    }
  };

  // Title screen flicker
  useEffect(() => {
    if (!isPlaying) {
      const t = setTimeout(() => setTitleFlicker(false), 1200);
      return () => clearTimeout(t);
    }
  }, [isPlaying]);

  // ── TITLE SCREEN ──────────────────────────────────────
  if (!isPlaying) {
    return (
      <TitleScreen 
        onStartGame={startGame}
        onOpenBreathing={() => setShowBreathing(true)}
        onOpenGrounding={() => setShowGrounding(true)}
      />
    );
  }

  const isHighlyStressed = stress > 80;
  const isLowEnergy = energy < 20;

  return (
    <div className={`flex w-full h-screen overflow-hidden ${isOverloaded ? 'overload-effect pointer-events-none' : isHighlyStressed ? 'glitch-effect' : ''}`}
         style={{ background: 'var(--color-bg-deep)' }}>
      
      {/* ── LEFT SIDEBAR ── */}
      <div className="sidebar w-60 flex flex-col z-10 overflow-y-auto">
        
        <SidebarTimeAndSchedule />

        {/* Stats */}
        <div className="sidebar-section">
          <p className="sidebar-label">Chỉ số</p>
          <div className="flex flex-col gap-2.5">
            <StatBar icon={<Activity size={13} />} label="Năng lượng" value={energy} type="energy" isWarning={isLowEnergy} />
            <StatBar icon={<Brain size={13} />} label="Stress" value={stress} type="stress" isWarning={isHighlyStressed} />
            <StatBar icon={<Users size={13} />} label="Kết nối" value={connection} type="connection" />
            <StatBar icon={<BookOpen size={13} />} label="Học lực" value={academics} type="academics" />
            {/* Chân Thật — chỉ hiện khi > 0 */}
            {authenticity > 0 && (
              <StatBar icon={<Heart size={13} />} label="Chân thật" value={authenticity} type="authenticity" />
            )}
          </div>
        </div>

        {/* Sound Controller Widget */}
        <SoundController />

        {/* Toolkit */}
        <div className="sidebar-section">
          <p className="sidebar-label">Hộp công cụ</p>
          <div className="flex flex-col gap-1">
            <button className="rpg-btn highlight" onClick={() => { audioSystem.playClick(); setShowBreathing(true); }}>
              <Wind size={13} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-medium" style={{ fontSize: '11px' }}>Thở 4-7-8</p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '9px' }}>
                  Giảm stress · Hồi NL
                </p>
              </div>
            </button>

            <button className="rpg-btn highlight" onClick={() => { audioSystem.playClick(); setShowGrounding(true); }}>
              <Flower2 size={13} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-medium" style={{ fontSize: '11px' }}>Grounding 5-4-3-2-1</p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '9px' }}>
                  Neo hiện tại · Giảm lo âu
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto sidebar-section text-center flex flex-col gap-2" style={{ borderBottom: 'none' }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '9px' }}>
            ⏱ {timeLimit} phút
          </p>
          <button 
            onClick={endGame}
            className="w-full py-1.5 rounded transition-all"
            style={{ 
              background: 'var(--color-bg-surface)', 
              color: 'var(--color-stress)',
              border: '1px solid var(--color-stress)',
              fontSize: '10px'
            }}>
            Về màn hình chính
          </button>
        </div>
      </div>

      {/* ── CENTER: GAME CANVAS ── */}
      <div className="flex-1 relative">
        <GameCanvas />
        <DialogueBox />
        <JournalModal />
        {currentLocation === 'main' && (
          <>
            <LibraryModal />
            <SchoolModal />
            <HospitalModal />
            {/* Screen Effects */}
          </>
        )}
        <FoodModal />
        <IntrusiveThought />
        {showOverloadStorm && <OverloadStormGame onWin={handleOverloadWin} onFail={handleOverloadFail} />}
        {showBreathing && <BreathingGame onClose={handleCloseBreathing} />}
        {showGrounding && <GroundingGame onClose={() => setShowGrounding(false)} />}
      </div>

      <CatChat />
    </div>
  );
}

// ── STAT BAR ──────────────────────────────────────────────
function StatBar({ icon, label, value, type, isWarning }) {
  return (
    <div>
      <div className={`flex justify-between items-center mb-1 ${isWarning ? 'stat-warning' : ''}`}>
        <div className="flex items-center gap-1.5" 
          style={{ color: isWarning ? 'var(--color-stress)' : 'var(--color-text-secondary)', fontSize: '10px' }}>
          {icon}
          <span style={{ letterSpacing: '0.03em' }}>{label}</span>
        </div>
        <span className="font-mono" style={{ fontSize: '10px', color: 'var(--color-text-primary)' }}>
          {Math.round(value)}
        </span>
      </div>
      <div className="stat-bar-track">
        <div className={`stat-bar-fill ${type}`} style={{ width: `${Math.min(100, value)}%` }}></div>
      </div>
    </div>
  );
}

// ── SIDEBAR TIME & SCHEDULE ───────────────────────────────
function SidebarTimeAndSchedule() {
  const inGameTime = useGameStore(state => state.inGameTime);
  const currentDay = useGameStore(state => state.currentDay);
  const currentChapter = useGameStore(state => state.currentChapter);
  const getSchedule = useGameStore(state => state.getSchedule);
  const schedule = getSchedule();

  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60) % 24;
    const m = Math.floor(minutes % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Header + Time */}
      <div className="sidebar-section text-center">
        <h2 className="font-pixel text-xs title-glow" style={{ color: 'var(--color-accent)', letterSpacing: '0.2em' }}>
          OVERLOAD
        </h2>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Chương {currentChapter} · Ngày {currentDay}
        </p>
        <div className="mt-2 font-mono text-lg py-1 rounded text-glow-energy"
             style={{ 
               color: 'var(--color-energy)', 
               background: 'var(--color-bg-deep)', 
               border: '1px solid var(--color-border)' 
             }}>
          {formatTime(inGameTime)}
        </div>
      </div>

      {/* Schedule Bar */}
      <div className="sidebar-section">
        <p className="sidebar-label">Lịch trình</p>
        <div className="flex items-center gap-2 px-1 py-1.5 rounded"
          style={{ 
            background: 'var(--color-bg-deep)', 
            border: '1px solid var(--color-border)',
            fontSize: '11px',
            color: 'var(--color-text-secondary)'
          }}>
          <span>{schedule.label}</span>
        </div>
      </div>
    </>
  );
}

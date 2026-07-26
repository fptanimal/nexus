import React, { useState } from 'react';
import { Sparkles, Star, Bird, Leaf, Cloud, Sun, Flower2, Circle, Heart, Check, Play, Settings, Volume2, VolumeX, Music, Speaker, X } from 'lucide-react';
import audioSystem from '../utils/audioSystem';
import useGameStore from '../store/useGameStore';

export default function TitleScreen({ onStartGame, onOpenBreathing, onOpenGrounding }) {
  const [selectedTime, setSelectedTime] = useState(30);
  const [selectedMood, setSelectedMood] = useState(1);
  const [showSoundMenu, setShowSoundMenu] = useState(false);

  const soundEnabled = useGameStore(state => state.soundEnabled);
  const bgmVolume = useGameStore(state => state.bgmVolume);
  const sfxVolume = useGameStore(state => state.sfxVolume);
  const toggleSound = useGameStore(state => state.toggleSound);
  const setBgmVolume = useGameStore(state => state.setBgmVolume);
  const setSfxVolume = useGameStore(state => state.setSfxVolume);
  const nextTrack = useGameStore(state => state.nextTrack);
  const prevTrack = useGameStore(state => state.prevTrack);

  const handleOpenSoundMenu = () => {
    audioSystem.init();
    audioSystem.playClick();
    if (!audioSystem.isPlayingBGM && soundEnabled) {
      audioSystem.startBGM();
    }
    setShowSoundMenu(!showSoundMenu);
  };

  const handleSelectTime = (time) => {
    audioSystem.init();
    audioSystem.playClick();
    setSelectedTime(time);
  };

  const handleStart = () => {
    audioSystem.init();
    audioSystem.playClick();
    onStartGame(selectedTime);
  };

  const moods = [
    { id: 0, emoji: '😊', label: 'Vui vẻ' },
    { id: 1, emoji: '😌', label: 'Bình thản' },
    { id: 2, emoji: '😐', label: 'Hơi mệt' },
    { id: 3, emoji: '😞', label: 'Áp lực' },
  ];

  const timeOptions = [
    { time: 15, label: '15 Phút', desc: 'Giải lao nhanh', colorClass: 'pebble-green' },
    { time: 30, label: '30 Phút', desc: 'Buổi tiêu chuẩn', colorClass: 'pebble-beige' },
    { time: 45, label: '45 Phút', desc: 'Trải nghiệm sâu', colorClass: 'pebble-grey' },
    { time: 60, label: '60 Phút', desc: 'Hành trình đầy đủ', colorClass: 'pebble-brown' },
  ];

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-start p-4 md:p-8 overflow-hidden select-none font-sans sky-bg">
      
      {/* Nền mây Pixel Art (CSS base) */}
      <div className="absolute inset-0 pointer-events-none sky-clouds"></div>

      {/* ── HEADER & VIP BADGE ── */}
      <div className="w-full flex justify-between items-start z-10 pt-2 px-4 md:px-12">
        <div className="hidden md:block w-48"></div>
        
        {/* Central Logo */}
        <div className="flex flex-col items-center text-center mx-auto mt-4">
          <h1 className="font-pixel text-5xl md:text-7xl tracking-wider font-extrabold"
              style={{
                color: '#d97706',
                WebkitTextStroke: '2px #78350f',
                textShadow: '6px 6px 0 #78350f',
                letterSpacing: '0.02em',
                lineHeight: '1.2'
              }}>
            OVERLOAD
          </h1>
          <p className="font-cursive text-3xl md:text-4xl mt-1 tracking-wide text-[#a18055] font-bold"
             style={{ fontFamily: "'Dancing Script', cursive", transform: 'rotate(-2deg)' }}>
            Trải nghiệm xoa dịu áp lực học đường
          </p>
        </div>

        {/* VIP Satirical Badge */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#fffcf0]/90 backdrop-blur-md border border-[#fef3c7] shadow-sm">
          <div className="text-right">
            <p className="text-[10px] font-bold tracking-wider text-[#b48a5c] uppercase">Lần chơi còn lại:</p>
            <p className="text-xs font-extrabold text-[#438a5e]">Trạng thái: VIP MIỄN PHÍ</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#fcd34d] to-[#d97706] border border-[#fde68a] flex items-center justify-center text-white shadow-inner transform rotate-3">
            <Star size={20} className="fill-[#fef3c7] text-[#fef3c7]" />
          </div>
        </div>
      </div>

      {/* ── PEBBLE TIME SELECTOR ── */}
      <div className="w-full max-w-4xl flex justify-center items-center gap-4 md:gap-8 z-10 mt-6 mb-8">
        {timeOptions.map((opt) => {
          const isSelected = selectedTime === opt.time;
          return (
            <button
              key={opt.time}
              onClick={() => handleSelectTime(opt.time)}
              className={`pebble ${opt.colorClass} ${isSelected ? 'pebble-selected' : ''}`}
            >
              <span className="font-bold text-sm md:text-base text-slate-800/80 drop-shadow-sm">
                {opt.label}
              </span>
              <span className="text-[9px] md:text-[10px] mt-0.5 font-medium text-slate-700/70">
                {opt.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── THERAPEUTIC MAIN PANEL ── */}
      <div className="relative w-full max-w-5xl therapeutic-panel pixel-panel p-6 md:p-8 z-10 mt-4">

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10 h-full">
          
          {/* LEFT WING: TÌM THẤY SỰ ĐỒNG CẢM */}
          <div className="md:col-span-4 flex flex-col items-center">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#3a5240] mb-8 drop-shadow-sm">
              TÌM THẤY SỰ ĐỒNG CẢM
            </h3>
            
            <div className="flex justify-center items-end w-full" style={{ marginLeft: '-20px' }}>
              {/* Card 1: Rừng */}
              <div className="therapy-card card-forest transform -rotate-12 translate-x-8 hover:-translate-y-2 hover:rotate-0 transition-all duration-300 z-10">
                <div className="card-inner">
                  <div className="card-pattern forest-pattern"></div>
                  <span className="card-label">Rừng</span>
                  <Bird size={20} className="absolute -top-3 -left-2 text-[#5a432b] fill-[#5a432b]" />
                </div>
              </div>
              
              {/* Card 2: Biển dịu */}
              <div className="therapy-card card-ocean hover:-translate-y-4 transition-all duration-300 z-20 shadow-xl scale-110">
                <div className="card-inner flex flex-col items-center justify-center pt-2">
                  <div className="text-4xl drop-shadow-sm mb-1">🐚</div>
                  <span className="card-label">Biển dịu</span>
                </div>
              </div>
              
              {/* Card 3: Mandala */}
              <div className="therapy-card card-mandala transform rotate-12 -translate-x-8 hover:-translate-y-2 hover:rotate-0 transition-all duration-300 z-10">
                <div className="card-inner">
                   <div className="card-pattern mandala-pattern"></div>
                   <span className="card-label">Mandala</span>
                </div>
              </div>
            </div>
          </div>

          {/* CENTER CORE: Hồ sơ, Nút Bubble, Năng lượng */}
          <div className="md:col-span-4 flex flex-col items-center border-l border-r border-[#96bda2]/30 px-2 h-full justify-between pb-4">
            
            {/* Top: Mood Profile */}
            <div className="flex items-center gap-1.5 bg-[#dbe8d9] px-3 py-1.5 rounded-full mb-2">
              <span className="text-[10px] font-semibold text-[#5c6e5f]">Hồ sơ Cảm Xúc:</span>
              <div className="flex gap-1">
                {moods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      audioSystem.playClick();
                      setSelectedMood(m.id);
                    }}
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs transition-transform ${
                      selectedMood === m.id ? 'scale-125 bg-white shadow-sm ring-1 ring-[#8bc34a]' : 'opacity-50 hover:opacity-100'
                    }`}
                  >
                    {m.emoji}
                  </button>
                ))}
              </div>
              <span className="text-[9px] text-[#788e7a] border-l border-[#b5cbb7] pl-2 ml-1">Dữ liệu Cơ Bản</span>
            </div>

            {/* Bubble Start Button */}
            <div className="relative flex justify-center items-center my-4">
              <button 
                onClick={handleStart}
                className="crystal-bubble flex items-center justify-center group outline-none"
              >
                <div className="crystal-glare"></div>
                <span className="font-extrabold text-3xl text-[#537d99] tracking-widest drop-shadow-[0_2px_2px_rgba(255,255,255,0.8)] group-hover:scale-105 transition-transform z-10">
                  BẮT ĐẦU
                </span>
                
                {/* Pixel art effect inner border */}
                <div className="absolute inset-2 border-[3px] border-dashed border-white/40 rounded-full rounded-bubble pointer-events-none"></div>
              </button>

              
              {/* Sound Button (ÂM THANH) */}
              <div className="absolute left-[-70px] md:left-[-90px] top-1/2 -translate-y-1/2 flex flex-col items-center z-20">
                <button 
                  onClick={handleOpenSoundMenu}
                  className="w-12 h-12 bg-[#e0e0e0] border-4 border-[#9e9e9e] flex items-center justify-center text-[#616161] shadow-[inset_-4px_-4px_0_0_#bdbdbd,inset_4px_4px_0_0_#ffffff] hover:bg-[#eeeeee] active:shadow-[inset_4px_4px_0_0_#bdbdbd] transition-none"
                  title="Cài đặt Âm thanh"
                >
                  {soundEnabled ? <Volume2 size={22} strokeWidth={3} /> : <VolumeX size={22} strokeWidth={3} />}
                </button>
                <span className="text-[10px] font-extrabold text-[#3e4e42] mt-2 tracking-tighter">ÂM THANH</span>
                
                {/* Popup Menu */}
                {showSoundMenu && (
                  <div className="absolute top-[60px] left-[-40px] md:left-[-20px] w-56 bg-[#f5f5f5] border-4 border-[#9e9e9e] p-3 shadow-[8px_8px_0_0_rgba(0,0,0,0.15)] z-50 text-left">
                    <button onClick={() => { audioSystem.playClick(); setShowSoundMenu(false); }} className="absolute top-1 right-1 text-[#9e9e9e] hover:text-[#424242] cursor-pointer">
                      <X size={16} strokeWidth={3} />
                    </button>
                    
                    <div className="mb-3 mt-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-[9px] text-[#757575]">BẬT / TẮT</span>
                        <input type="checkbox" checked={soundEnabled} onChange={() => { 
                          audioSystem.playClick(); 
                          toggleSound(); 
                          if (!soundEnabled && !audioSystem.isPlayingBGM) {
                            audioSystem.startBGM();
                          }
                        }} className="w-4 h-4 cursor-pointer" />
                      </div>
                    </div>
                    
                    {soundEnabled && (
                      <>
                        <div className="mb-3">
                          <label className="flex items-center justify-between font-extrabold text-[10px] text-[#616161] mb-1">
                            <span className="flex items-center gap-1"><Music size={12} /> CHUYỂN BÀI</span>
                            <div className="flex gap-2">
                              <button onClick={() => { audioSystem.playClick(); prevTrack(); }} className="px-2 py-0.5 bg-[#e0e0e0] border border-[#9e9e9e] hover:bg-[#d5d5d5]">◀</button>
                              <button onClick={() => { audioSystem.playClick(); nextTrack(); }} className="px-2 py-0.5 bg-[#e0e0e0] border border-[#9e9e9e] hover:bg-[#d5d5d5]">▶</button>
                            </div>
                          </label>
                        </div>

                        <div className="mb-3">
                          <label className="flex items-center justify-between font-extrabold text-[10px] text-[#616161] mb-1">
                            <span>NHẠC NỀN</span>
                          </label>
                          <input type="range" min="0" max="1" step="0.05" value={bgmVolume} onChange={(e) => setBgmVolume(parseFloat(e.target.value))} className="w-full h-2 bg-[#bdbdbd] appearance-none rounded-none outline-none cursor-pointer" />
                        </div>
                        
                        <div>
                          <label className="flex items-center justify-between font-extrabold text-[10px] text-[#616161] mb-1">
                            <span>HIỆU ỨNG</span>
                          </label>
                          <input type="range" min="0" max="1" step="0.05" value={sfxVolume} onChange={(e) => { setSfxVolume(parseFloat(e.target.value)); audioSystem.playClick(); }} className="w-full h-2 bg-[#bdbdbd] appearance-none rounded-none outline-none cursor-pointer" />
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Settings Button (TÂM LÝ CHÍNH) */}
              <div className="absolute right-[-70px] md:right-[-90px] top-1/2 -translate-y-1/2 flex flex-col items-center z-20">
                <button 
                  onClick={() => audioSystem.playClick()}
                  className="w-12 h-12 bg-[#e0e0e0] border-4 border-[#9e9e9e] flex items-center justify-center text-[#616161] shadow-[inset_-4px_-4px_0_0_#bdbdbd,inset_4px_4px_0_0_#ffffff] hover:bg-[#eeeeee] active:shadow-[inset_4px_4px_0_0_#bdbdbd] transition-none"
                  title="Cài đặt tâm lý"
                >
                  <Settings size={22} strokeWidth={3} />
                </button>
                <span className="text-[10px] font-extrabold text-[#3e4e42] mt-2 tracking-tighter">CÀI ĐẶT</span>
              </div>
            </div>

            {/* Bottom Energy Gauge */}
            <div className="w-full max-w-[220px] flex flex-col items-center mt-6">
              <div className="w-full flex justify-between items-end px-1 mb-1.5">
                <span className="text-[10px] font-bold text-[#f57c00]">Năng lượng</span>
                <span className="text-[10px] font-extrabold text-[#2e4a33]">CÂN BẰNG NĂNG LƯỢNG</span>
                <span className="text-[10px] font-bold text-[#0288d1]">Bình tĩnh</span>
              </div>
              <div className="w-full h-2.5 rounded-full overflow-hidden p-0 bg-[#e0e0e0] border border-[#a8bda9] flex shadow-inner">
                <div className="w-1/2 h-full bg-gradient-to-r from-[#ffa726] to-[#9ccc65]"></div>
                <div className="w-1/2 h-full bg-gradient-to-r from-[#9ccc65] to-[#29b6f6]"></div>
              </div>
              <div className="flex items-center gap-1 mt-1.5 text-[#558a59] font-medium text-[10px]">
                <Check size={12} strokeWidth={3} className="border border-[#558a59] rounded-full p-0.5" />
                <span>Neo hiện tại chuẩn xác</span>
              </div>
            </div>
            
          </div>

          {/* RIGHT WING: LẤY LẠI CÂN BẰNG */}
          <div className="md:col-span-4 flex flex-col items-start pl-4 md:pl-8 h-full pt-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#3a5240] mb-5 drop-shadow-sm">
              LẤY LẠI CÂN BẰNG
            </h3>
            
            <div className="flex flex-col gap-4 w-full">
              {/* Item 1 */}
              <button 
                onClick={() => { audioSystem.playClick(); if (onOpenBreathing) onOpenBreathing(); }}
                className="therapy-list-item group"
              >
                <div className="flower-icon text-2xl drop-shadow-sm">🌼</div>
                <div className="text-left ml-3">
                  <p className="text-sm font-bold text-[#3e4e42] group-hover:text-[#2e3b31] transition-colors">Hít Thở 4-7-8</p>
                  <p className="text-[10px] text-[#6b8270] mt-0.5">Giảm căng thẳng nhịp tim</p>
                </div>
              </button>

              {/* Item 2 */}
              <button 
                onClick={() => { audioSystem.playClick(); if (onOpenGrounding) onOpenGrounding(); }}
                className="therapy-list-item group"
              >
                <div className="flower-icon text-2xl drop-shadow-sm">🌸</div>
                <div className="text-left ml-3">
                  <p className="text-sm font-bold text-[#3e4e42] group-hover:text-[#2e3b31] transition-colors">Tỉnh Thức 5-4-3-2-1</p>
                  <p className="text-[10px] text-[#6b8270] mt-0.5">Neo giữ thực tại (Grounding)</p>
                </div>
              </button>

              {/* Item 3 */}
              <div className="therapy-list-item opacity-90 cursor-default">
                <div className="flower-icon text-2xl drop-shadow-sm relative">
                  🏵️
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white mb-0.5">3</span>
                </div>
                <div className="text-left ml-3">
                  <p className="text-sm font-bold text-[#5c6e5f]">Phục Hồi Thư Giãn</p>
                  <p className="text-[10px] text-[#809985] mt-0.5">Tái tạo năng lượng phòng riêng</p>
                </div>
              </div>

              {/* Item 4 */}
              <div className="therapy-list-item opacity-90 cursor-default">
                <div className="flower-icon text-2xl drop-shadow-sm relative">
                  🏵️
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white mb-0.5">4</span>
                </div>
                <div className="text-left ml-3">
                  <p className="text-sm font-bold text-[#5c6e5f]">Đặt Lại Mục Tiêu</p>
                  <p className="text-[10px] text-[#809985] mt-0.5">Sổ nhật ký & thấu cảm</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

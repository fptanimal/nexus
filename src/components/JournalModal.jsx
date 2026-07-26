import React, { useState, useEffect } from 'react';
import useGameStore from '../store/useGameStore';
import { Book, PenLine } from 'lucide-react';
import audioSystem from '../utils/audioSystem';

export default function JournalModal() {
  const isJournalOpen = useGameStore(state => state.isJournalOpen);
  const openJournal = useGameStore(state => state.openJournal);
  const closeJournal = useGameStore(state => state.closeJournal);
  const journalLogs = useGameStore(state => state.journalLogs);
  const [userText, setUserText] = useState('');

  // Load nhật ký của user từ localStorage khi mở
  useEffect(() => {
    if (isJournalOpen) {
      const savedText = localStorage.getItem('overload_user_journal') || '';
      setUserText(savedText);
    }
  }, [isJournalOpen]);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setUserText(newText);
    localStorage.setItem('overload_user_journal', newText);
  };

  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60) % 24;
    const m = Math.floor(minutes % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Journal FAB — styled as pixel button */}
      <button 
        onClick={() => { audioSystem.playClick(); openJournal(); }}
        className="absolute bottom-4 right-4 z-40 flex items-center gap-2 group transition-all"
        style={{ 
          background: 'var(--color-bg-base)',
          border: '2px solid var(--color-border-light)',
          padding: '10px 14px',
          borderRadius: '2px',
          color: 'var(--color-text-secondary)',
          boxShadow: '2px 2px 0 0 var(--color-border)'
        }}
      >
        <Book size={18} />
        <span className="font-pixel hidden group-hover:block" 
          style={{ fontSize: '7px', letterSpacing: '0.1em' }}>
          CUỐN SỔ
        </span>
      </button>

      {isJournalOpen && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-4">
          <div className="modal-overlay absolute inset-0" onClick={() => closeJournal()}></div>
          
          <div className="modal-content relative w-full max-w-4xl flex flex-col fade-in" 
            style={{ height: '80vh', borderRadius: '4px' }}>
            
            {/* Header */}
            <div className="flex justify-between items-center px-5 py-4"
              style={{ borderBottom: '1px solid var(--color-border)' }}>
              <div className="flex items-center gap-3">
                <Book size={18} style={{ color: 'var(--color-energy)' }} />
                <h2 className="font-pixel" style={{ fontSize: '10px', color: 'var(--color-text-primary)', letterSpacing: '0.1em' }}>
                  NHẬT KÝ ĐỒNG HÀNH
                </h2>
              </div>
              <button onClick={() => { audioSystem.playClick(); closeJournal(); }} className="font-pixel transition-colors"
                style={{ fontSize: '8px', color: 'var(--color-text-muted)', padding: '4px 8px', border: '1px solid var(--color-border)', background: 'var(--color-bg-surface)', cursor: 'pointer' }}>
                ĐÓNG
              </button>
            </div>
            
            {/* Two-column layout */}
            <div className="flex-1 flex overflow-hidden">
              
              {/* Nửa trái: Game thuật lại */}
              <div className="w-1/2 h-full overflow-y-auto p-5 border-r border-[#3a3a4a] bg-[#1e1e28]">
                <h3 className="font-pixel text-[9px] text-[#8bc34a] mb-4 tracking-widest uppercase">Trải nghiệm trong game</h3>
                <div className="space-y-4">
                  {journalLogs.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center mt-10" 
                      style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '12px' }}>
                      Game đang quan sát và sẽ ghi chép lại những gì cậu làm...
                    </div>
                  ) : (
                    journalLogs.map((log, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="font-mono shrink-0 text-glow-energy"
                          style={{ 
                            fontSize: '10px',
                            color: 'var(--color-energy)',
                            background: 'var(--color-bg-deep)',
                            padding: '3px 8px',
                            border: '1px solid var(--color-border)',
                            borderRadius: '1px'
                          }}>
                          {formatTime(log.time)}
                        </div>
                        <div className="journal-page flex-1 px-4 py-3 text-sm leading-relaxed text-[#c0c0c0] bg-[#1a1a24] border border-[#2a2a35] shadow-inner">
                          {log.text}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Nửa phải: Người chơi viết */}
              <div className="w-1/2 h-full flex flex-col p-5 bg-[#15151e] relative">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-pixel text-[9px] text-[#f48fb1] tracking-widest uppercase flex items-center gap-2">
                    <PenLine size={12} /> Còn ngoài đời thì sao?
                  </h3>
                  <span className="text-[8px] text-[#606060] italic">Lưu 100% trên máy của cậu</span>
                </div>
                
                <textarea 
                  value={userText}
                  onChange={handleTextChange}
                  placeholder="Hãy viết ra điều gì đó... Cảm giác nặng nề nhất hôm nay là gì? Hay đơn giản là cậu đã ăn gì trưa nay?"
                  className="flex-1 w-full p-4 text-sm leading-relaxed resize-none outline-none focus:ring-1 focus:ring-[#f48fb1]"
                  style={{
                    background: '#1a1a24',
                    border: '1px solid #2a2a35',
                    color: '#e0e0e0',
                    fontFamily: "'Caveat', cursive",
                    fontSize: '18px',
                    borderRadius: '4px'
                  }}
                />
                
                <div className="mt-4 flex justify-between items-center">
                  <p className="text-[10px] text-[#606060]">Overload không đọc và không lưu dữ liệu này lên mạng.</p>
                  <button className="text-[10px] text-red-400 hover:text-red-300 transition-colors border border-red-500/30 px-3 py-1.5 bg-red-500/10 cursor-pointer"
                    onClick={() => window.open('tel:1800599920', '_blank')}>
                    Cần giúp đỡ khẩn cấp?
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}

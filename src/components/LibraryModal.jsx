import React from 'react';
import useGameStore from '../store/useGameStore';
import { BookOpen, Brain, Coffee, X } from 'lucide-react';
import audioSystem from '../utils/audioSystem';

export default function LibraryModal() {
  const isLibraryModalOpen = useGameStore(state => state.isLibraryModalOpen);
  const closeLibraryModal = useGameStore(state => state.closeLibraryModal);
  const study = useGameStore(state => state.study);
  const rest = useGameStore(state => state.rest);

  if (!isLibraryModalOpen) return null;

  const handleStudy = (subject) => {
    audioSystem.playClick();
    if (window.triggerPlayerAnimation) {
      if (subject === 'code') window.triggerPlayerAnimation('code', 4000);
      else window.triggerPlayerAnimation('study', 4000);
    }
    study();
    closeLibraryModal();
  };

  const handleRead = () => {
    audioSystem.playClick();
    if (window.triggerPlayerAnimation) window.triggerPlayerAnimation('read', 4000);
    rest();
    closeLibraryModal();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#24242e] border-2 border-[#3a3a4a] rounded-xl shadow-2xl p-6 w-full max-w-md relative animate-in fade-in zoom-in duration-200">
        <button 
          onClick={() => { audioSystem.playClick(); closeLibraryModal(); }}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-[#3a3a4a] rounded-full flex items-center justify-center mb-4">
            <BookOpen size={32} className="text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Thư viện trường</h2>
          <p className="text-gray-400 text-center text-sm">
            Không gian yên tĩnh lý tưởng để nạp lại năng lượng hoặc trau dồi kiến thức. Bạn muốn làm gì?
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={handleRead}
            className="w-full flex items-center gap-4 bg-[#2a2a35] hover:bg-[#323242] p-4 rounded-lg border border-[#3a3a4a] transition-colors text-left group"
          >
            <div className="bg-green-500/20 p-3 rounded-lg group-hover:bg-green-500/30 transition-colors">
              <Coffee size={24} className="text-green-400" />
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">Đọc sách thư giãn</h3>
              <p className="text-xs text-gray-400">Đọc một cuốn tiểu thuyết nhẹ nhàng (+ Năng lượng)</p>
            </div>
          </button>
          
          <div className="text-gray-400 text-xs font-semibold mt-2 mb-1 px-2 uppercase tracking-wider">Học tập & Nghiên cứu (- Năng lượng, + Học tập)</div>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => handleStudy('code')} className="bg-[#2a2a35] hover:bg-purple-900/40 p-3 rounded-lg border border-[#3a3a4a] transition-colors text-white text-sm font-medium">💻 Học Code</button>
            <button onClick={() => handleStudy('english')} className="bg-[#2a2a35] hover:bg-blue-900/40 p-3 rounded-lg border border-[#3a3a4a] transition-colors text-white text-sm font-medium">🇬🇧 Tiếng Anh</button>
            <button onClick={() => handleStudy('french')} className="bg-[#2a2a35] hover:bg-red-900/40 p-3 rounded-lg border border-[#3a3a4a] transition-colors text-white text-sm font-medium">🇫🇷 Tiếng Pháp</button>
            <button onClick={() => handleStudy('history')} className="bg-[#2a2a35] hover:bg-yellow-900/40 p-3 rounded-lg border border-[#3a3a4a] transition-colors text-white text-sm font-medium">🏛️ Lịch sử</button>
            <button onClick={() => handleStudy('geography')} className="bg-[#2a2a35] hover:bg-green-900/40 p-3 rounded-lg border border-[#3a3a4a] transition-colors text-white text-sm font-medium">🌍 Địa lý</button>
            <button onClick={() => handleStudy('math')} className="bg-[#2a2a35] hover:bg-orange-900/40 p-3 rounded-lg border border-[#3a3a4a] transition-colors text-white text-sm font-medium">📐 Toán học</button>
          </div>
        </div>
      </div>
    </div>
  );
}

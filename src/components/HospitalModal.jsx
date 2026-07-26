import React from 'react';
import useGameStore from '../store/useGameStore';
import audioSystem from '../utils/audioSystem';

export default function HospitalModal() {
  const isHospitalModalOpen = useGameStore(state => state.isHospitalModalOpen);
  const closeHospitalModal = useGameStore(state => state.closeHospitalModal);
  const attendTherapy = useGameStore(state => state.attendTherapy);
  const addJournalEntry = useGameStore(state => state.addJournalEntry);

  if (!isHospitalModalOpen) return null;

  const handleTherapy = () => {
    audioSystem.playClick();
    attendTherapy();
    addJournalEntry('Tôi đã dành 15 phút nói chuyện với bác sĩ tâm lý. Cảm giác nhẹ nhõm hơn nhiều.');
    closeHospitalModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 border-2 border-white/20 bg-slate-900 rounded-lg shadow-2xl relative">
        <button 
          onClick={() => {
            audioSystem.playClick();
            closeHospitalModal();
          }}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded"
        >
          ✕
        </button>
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2 font-pixel tracking-wider">BỆNH VIỆN</h2>
          <p className="text-sm text-slate-400">Phòng khám Tâm lý</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleTherapy}
            className="w-full p-4 flex flex-col items-start gap-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded transition-colors group"
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-bold text-blue-400 group-hover:text-blue-300">Trị liệu tâm lý (15 phút)</span>
              <span className="text-xs px-2 py-1 bg-green-900/50 text-green-400 rounded">-20 Stress</span>
            </div>
            <p className="text-xs text-slate-400 text-left">
              Ngồi nói chuyện với bác sĩ tâm lý để giải tỏa căng thẳng và tìm lại sự kết nối.
            </p>
          </button>
          
          <button
            onClick={() => {
              audioSystem.playClick();
              closeHospitalModal();
            }}
            className="w-full p-3 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
          >
            Rời đi
          </button>
        </div>
      </div>
    </div>
  );
}

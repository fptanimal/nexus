import React from 'react';
import useGameStore from '../store/useGameStore';
import { BookOpen, Monitor, Dumbbell, Beaker, X, ArrowRight, Home } from 'lucide-react';
import audioSystem from '../utils/audioSystem';

export default function SchoolModal() {
  const isSchoolModalOpen = useGameStore(state => state.isSchoolModalOpen);
  const closeSchoolModal = useGameStore(state => state.closeSchoolModal);
  const currentPeriod = useGameStore(state => state.currentPeriod);
  const attendClass = useGameStore(state => state.attendClass);
  const resetSchoolDay = useGameStore(state => state.resetSchoolDay);
  const setPlayerAnim = useGameStore(state => state.setPlayerAnim);

  if (!isSchoolModalOpen) return null;

  const schedule = [
    { period: 1, subject: 'Toán học', icon: <BookOpen size={20} /> },
    { period: 2, subject: 'Văn học', icon: <BookOpen size={20} /> },
    { period: 3, subject: 'Vật lý', icon: <Beaker size={20} /> },
    { period: 4, subject: 'Hóa học', icon: <Beaker size={20} /> },
    { period: 5, subject: 'Thể dục (PE)', icon: <Dumbbell size={20} /> },
    { period: 6, subject: 'Lịch sử', icon: <BookOpen size={20} /> },
    { period: 7, subject: 'Tiếng Anh', icon: <BookOpen size={20} /> },
    { period: 8, subject: 'Tin học (Code)', icon: <Monitor size={20} /> },
  ];

  const handleAttend = (subject) => {
    audioSystem.playClick();
    attendClass(subject);
    
    let animType = 'study';
    if (subject === 'Thể dục (PE)') animType = 'pe';
    else if (subject === 'Tin học (Code)') animType = 'code';
    else if (subject === 'Hóa học') animType = 'science';
    else if (subject === 'Vật lý') animType = 'physics';
    else if (subject === 'Toán học') animType = 'math';
    else if (subject === 'Văn học') animType = 'literature';
    else if (subject === 'Tiếng Anh') animType = 'english';
    else if (subject === 'Lịch sử') animType = 'history';

    if (window.triggerPlayerAnimation) {
      window.triggerPlayerAnimation(animType, 3000);
    }
    
    // Close modal briefly to show animation
    closeSchoolModal();
    setTimeout(() => {
      useGameStore.getState().openSchoolModal();
    }, 3000); // 3 seconds animation
  };

  const handleGoHome = () => {
    audioSystem.playClick();
    resetSchoolDay();
    closeSchoolModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#fdf6e3] text-[#4a3f35] rounded-xl shadow-2xl p-6 w-full max-w-md border-4 border-[#82684b] relative">
        <button 
          onClick={closeSchoolModal}
          className="absolute top-3 right-3 text-[#82684b] hover:text-red-500 transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center border-b-2 border-[#82684b] pb-2 font-mono">
          Lịch Học Hôm Nay
        </h2>

        <div className="space-y-3 mb-6">
          {schedule.map((item) => {
            const isCompleted = item.period < currentPeriod;
            const isCurrent = item.period === currentPeriod;
            
            return (
              <div 
                key={item.period} 
                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                  isCompleted ? 'bg-gray-200 border-gray-300 opacity-60' :
                  isCurrent ? 'bg-white border-blue-400 shadow-md transform scale-[1.02]' :
                  'bg-white border-[#dcd0b8] opacity-80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${isCurrent ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-bold">Tiết {item.period}</div>
                    <div className="text-sm">{item.subject}</div>
                  </div>
                </div>
                
                {isCompleted && (
                  <span className="text-green-600 font-bold text-sm">Đã học ✓</span>
                )}
                {isCurrent && (
                  <button 
                    onClick={() => handleAttend(item.subject)}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                  >
                    Vào lớp <ArrowRight size={16} />
                  </button>
                )}
                {(!isCompleted && !isCurrent) && (
                  <span className="text-gray-400 text-sm">Chưa tới giờ</span>
                )}
              </div>
            );
          })}
        </div>

        {currentPeriod > 8 && (
          <div className="text-center animate-bounce">
            <button 
              onClick={handleGoHome}
              className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white p-4 rounded-xl font-bold text-lg transition-colors shadow-lg"
            >
              <Home size={24} />
              Tan Học (Đi Về)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

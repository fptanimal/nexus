import React, { useState } from 'react';
import useGameStore from '../store/useGameStore';
import audioSystem from '../utils/audioSystem';

const QUESTIONS = [
  { 
    text: "Dạo gần đây bạn có cảm thấy mệt mỏi và kiệt sức dù không làm gì nặng nhọc không?", 
    options: [
      { text: "Không hề", score: 0 }, 
      { text: "Thỉnh thoảng", score: 1 }, 
      { text: "Thường xuyên", score: 2 }, 
      { text: "Liên tục", score: 3 }
    ] 
  },
  { 
    text: "Bạn có dễ nổi cáu hoặc cảm thấy khó chịu với những chuyện nhỏ nhặt không?", 
    options: [
      { text: "Không bao giờ", score: 0 }, 
      { text: "Ít khi", score: 1 }, 
      { text: "Khá thường xuyên", score: 2 }, 
      { text: "Lúc nào cũng vậy", score: 3 }
    ] 
  },
  { 
    text: "Bạn có cảm thấy lo lắng vô cớ hoặc sợ hãi về tương lai (thi cử, điểm số) không?", 
    options: [
      { text: "Không có", score: 0 }, 
      { text: "Đôi khi", score: 1 }, 
      { text: "Nhiều lần", score: 2 }, 
      { text: "Rất ám ảnh", score: 3 }
    ] 
  },
  { 
    text: "Chất lượng giấc ngủ của bạn dạo này thế nào?", 
    options: [
      { text: "Rất ngon", score: 0 }, 
      { text: "Hơi trằn trọc", score: 1 }, 
      { text: "Hay thức giấc", score: 2 }, 
      { text: "Mất ngủ hoàn toàn", score: 3 }
    ] 
  }
];

export default function HospitalModal() {
  const isHospitalModalOpen = useGameStore(state => state.isHospitalModalOpen);
  const closeHospitalModal = useGameStore(state => state.closeHospitalModal);
  const attendTherapy = useGameStore(state => state.attendTherapy);
  const addJournalEntry = useGameStore(state => state.addJournalEntry);

  const [step, setStep] = useState(0); // 0 = intro, 1 = test, 2 = result
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);

  if (!isHospitalModalOpen) return null;

  const handleStartTest = () => {
    audioSystem.playClick();
    setStep(1);
    setCurrentQ(0);
    setScore(0);
  };

  const handleAnswer = (points) => {
    audioSystem.playClick();
    const newScore = score + points;
    if (currentQ < QUESTIONS.length - 1) {
      setScore(newScore);
      setCurrentQ(currentQ + 1);
    } else {
      setScore(newScore);
      setStep(2);
      applyResult(newScore);
    }
  };

  const applyResult = (finalScore) => {
    attendTherapy(); // Time passes
    let diagnosis = "";
    let stressRelief = 0;

    if (finalScore <= 3) {
      diagnosis = "Sức khỏe tâm lý của bạn khá ổn định.";
      stressRelief = 10;
    } else if (finalScore <= 7) {
      diagnosis = "Bạn đang có dấu hiệu căng thẳng nhẹ.";
      stressRelief = 20;
    } else {
      diagnosis = "Bạn đang bị quá tải và stress nghiêm trọng.";
      stressRelief = 40;
    }

    useGameStore.setState(state => ({
      stress: Math.max(0, state.stress - stressRelief)
    }));
    
    addJournalEntry(`Tôi đã làm bài kiểm tra tâm lý. Bác sĩ nói: "${diagnosis}". Tôi cảm thấy nhẹ nhõm hơn phần nào (-${stressRelief} Stress).`);
  };

  const handleClose = () => {
    audioSystem.playClick();
    setStep(0);
    closeHospitalModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 border-2 border-white/20 bg-slate-900 rounded-lg shadow-2xl relative">
        <button 
          onClick={handleClose}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded"
        >
          ✕
        </button>
        
        {step === 0 && (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2 font-pixel tracking-wider">PHÒNG KHÁM TÂM LÝ</h2>
              <p className="text-sm text-slate-400">Bác sĩ: "Chào bạn. Mời bạn làm một bài đánh giá tâm lý nhỏ để tôi hiểu rõ hơn về tình trạng của bạn nhé."</p>
            </div>
            <div className="space-y-4">
              <button
                onClick={handleStartTest}
                className="w-full p-4 flex flex-col items-center gap-1 bg-slate-800 hover:bg-blue-900 border border-slate-600 rounded transition-colors group"
              >
                <span className="font-bold text-blue-400 group-hover:text-white">Bắt đầu bài Test Tâm Lý (15 phút)</span>
              </button>
              <button
                onClick={handleClose}
                className="w-full p-3 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
              >
                Để khi khác
              </button>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="mb-6">
              <div className="flex justify-between text-xs text-slate-500 mb-2 font-pixel">
                <span>Câu hỏi {currentQ + 1}/{QUESTIONS.length}</span>
              </div>
              <h3 className="text-lg text-white font-medium mb-4 leading-relaxed">
                {QUESTIONS[currentQ].text}
              </h3>
            </div>
            <div className="space-y-3">
              {QUESTIONS[currentQ].options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(opt.score)}
                  className="w-full p-3 text-left bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 rounded transition-colors text-slate-200"
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white mb-4 font-pixel tracking-wider">KẾT QUẢ ĐÁNH GIÁ</h2>
              <div className="p-4 bg-slate-800 rounded border border-slate-700 mb-4">
                <p className="text-slate-300 leading-relaxed mb-4">
                  {score <= 3 ? "Bác sĩ mỉm cười: 'Tình trạng của bạn khá ổn. Hãy cố gắng giữ vững tinh thần nhé.'" :
                   score <= 7 ? "Bác sĩ ghi chú: 'Bạn đang chịu một chút áp lực. Hãy dành thời gian để nghỉ ngơi và đừng quá ép bản thân.'" :
                   "Bác sĩ nhìn bạn lo lắng: 'Tình trạng căng thẳng của bạn đang ở mức báo động. Bạn cần ngắt kết nối và nghỉ ngơi ngay lập tức.'"}
                </p>
                <div className="flex items-center justify-center gap-2 text-green-400 bg-green-900/30 py-2 rounded">
                  <span className="font-bold text-lg">Đã giảm {score <= 3 ? 10 : score <= 7 ? 20 : 40} Stress</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-full p-4 font-bold text-white bg-blue-600 hover:bg-blue-500 rounded transition-colors"
            >
              Cảm ơn Bác sĩ
            </button>
          </>
        )}
      </div>
    </div>
  );
}

import React, { useEffect } from 'react';
import useGameStore from '../store/useGameStore';
import audioSystem from '../utils/audioSystem';

const NPC_DATA = {
  minh: {
    emoji: '🧑‍🎓',
    name: 'Minh',
    dialogue: 'Cậu ôn bài tới đâu rồi? Tớ ôn 3 lượt rồi mà vẫn thấy run quá... tớ buồn nôn mất.',
    speakOutText: 'Tớ cũng đang rất áp lực... Tớ không biết phải ôn thế nào nữa.',
    hideText: 'Cười trừ: "Ừ, tớ cũng đang ôn đây."'
  },
  ha: {
    emoji: '👧',
    name: 'Hà',
    dialogue: 'Ê đi ăn không? Học làm gì lắm, mốt ra trường cũng đi làm thuê thôi hahahaha!',
    speakOutText: 'Thật ra tớ cũng chẳng vui đâu... Tớ chỉ đùa để quên đi thôi.',
    hideText: 'Cười theo: "Ừ ha, đúng rồi haha."'
  },
  tuan: {
    emoji: '🧑',
    name: 'Tuấn',
    dialogue: '(Tuấn đang đeo tai nghe, nhìn xa xăm, không nói gì.)',
    speakOutText: 'Tuấn... cậu có ổn không? Tớ thấy dạo này cậu hay ngồi một mình.',
    hideText: 'Gật đầu rồi đi tiếp, giả vờ không thấy gì.'
  },
  ba: {
    emoji: '👨',
    name: 'Ba',
    dialogue: 'Học hành sao rồi con? Ráng lên, sắp thi rồi đừng có lười biếng. Ba mẹ đặt hết kỳ vọng vào con đó.',
    speakOutText: 'Con... con thấy hơi mệt. Con sợ mình làm không được...',
    hideText: 'Gật đầu: "Dạ, con vẫn đang cố gắng."'
  },
  me: {
    emoji: '👩',
    name: 'Mẹ',
    dialogue: 'Con ăn gì chưa? Nhớ học bài xong sớm rồi ngủ nhé, thức khuya không tốt đâu, nhưng bài thì phải học thuộc đó.',
    speakOutText: 'Mẹ ơi, con thấy áp lực quá. Kiến thức nhiều quá con nạp không kịp...',
    hideText: 'Mỉm cười: "Dạ, con ăn rồi. Con học một chút nữa rồi ngủ."'
  },
  khang: {
    emoji: '🧑‍🦱',
    name: 'Khang',
    dialogue: 'Này, đi nhanh lên không muộn học bây giờ. Hôm nay có bài kiểm tra 15 phút đầu giờ đấy, ôn kỹ chưa?',
    speakOutText: 'Chết thật... tớ mệt quá nên quên bẵng đi mất. Đầu tớ đang trống rỗng.',
    hideText: 'Cố tỏ ra tự tin: "Rồi, tớ ôn kỹ rồi."'
  },
  linh: {
    emoji: '👱‍♀️',
    name: 'Linh',
    dialogue: 'Trời ơi bài tập hôm qua khó kinh khủng, tớ thức đến 2h sáng mới làm xong. Cậu làm hết chưa?',
    speakOutText: 'Tớ không làm nổi... Tớ cảm thấy mình đang bị quá tải mất rồi Linh ơi.',
    hideText: 'Lảng tránh: "À ừ... bài khó thật."'
  }
};

export default function DialogueBox() {
  const activeDialogue = useGameStore(state => state.activeDialogue);
  const endDialogue = useGameStore(state => state.endDialogue);
  const speakOut = useGameStore(state => state.speakOut);
  const addJournalEntry = useGameStore(state => state.addJournalEntry);
  const energy = useGameStore(state => state.energy);
  const logDecision = useGameStore(state => state.logDecision);
  
  useEffect(() => {
    if (activeDialogue) {
      audioSystem.playTypewriter();
    }
  }, [activeDialogue]);

  if (!activeDialogue) return null;

  const npc = NPC_DATA[activeDialogue] || NPC_DATA.minh;

  const handleSpeakOut = () => {
    if (energy < 15) return;
    audioSystem.playClick();
    speakOut();
    logDecision(`spoken_${activeDialogue}`);
    addJournalEntry(`Tôi đã nói với ${npc.name} rằng mình đang không ổn. Rất đáng sợ, nhưng tôi thấy nhẹ nhõm hơn một chút.`);
    endDialogue();
  };

  const handleHide = () => {
    audioSystem.playClick();
    logDecision(`ignored_${activeDialogue}`);
    addJournalEntry(`Tôi gặp ${npc.name} nhưng quyết định im lặng và cười trừ.`);
    endDialogue();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center p-6">
      {/* Overlay */}
      <div className="modal-overlay absolute inset-0" onClick={endDialogue}></div>
      
      {/* Dialogue Box — Bottom of screen like classic RPG */}
      <div className="dialogue-box relative w-full max-w-2xl p-5 fade-in" style={{ borderRadius: '4px' }}>
        
        {/* NPC Name Tag */}
        <div className="absolute -top-4 left-4 flex items-center gap-2 px-3 py-1"
          style={{ 
            background: 'var(--color-bg-deep)', 
            border: '1px solid var(--color-border-light)',
            borderRadius: '2px'
          }}>
          <span style={{ fontSize: '14px' }}>{npc.emoji}</span>
          <span className="font-pixel" style={{ fontSize: '8px', color: 'var(--color-text-primary)', letterSpacing: '0.1em' }}>
            {npc.name}
          </span>
        </div>

        {/* Dialogue Text */}
        <div className="mb-5 mt-1 px-1">
          <p style={{ color: 'var(--color-text-primary)', lineHeight: 1.7, fontSize: '13px' }}>
            {npc.dialogue}
          </p>
        </div>

        {/* Choices */}
        <div className="flex flex-col gap-1">
          <button 
            onClick={handleSpeakOut}
            disabled={energy < 15}
            className={`dialogue-choice speak-out ${energy < 15 ? 'opacity-35 cursor-not-allowed' : ''}`}
            style={{ borderRadius: '2px' }}
          >
            <div className="flex justify-between items-center w-full">
              <span style={{ color: energy >= 15 ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>
                [Nói ra] {npc.speakOutText}
              </span>
              <span className="font-pixel shrink-0 ml-3" 
                style={{ fontSize: '7px', color: 'var(--color-stress)', opacity: 0.7 }}>
                -15 NL
              </span>
            </div>
          </button>

          <button onClick={handleHide} className="dialogue-choice" style={{ borderRadius: '2px' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>
              [Che giấu] {npc.hideText}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

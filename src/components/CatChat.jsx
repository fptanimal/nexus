import React, { useState, useRef, useEffect } from 'react';
import useGameStore from '../store/useGameStore';
import { Send } from 'lucide-react';

export default function CatChat() {
  const catMessages = useGameStore(state => state.catMessages);
  const addCatMessage = useGameStore(state => state.addCatMessage);
  const decreaseStress = useGameStore(state => state.decreaseStress);
  const addJournalEntry = useGameStore(state => state.addJournalEntry);
  const geminiApiKey = useGameStore(state => state.geminiApiKey);
  const isLaptopOpen = useGameStore(state => state.isLaptopOpen);
  const closeLaptop = useGameStore(state => state.closeLaptop);
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [catMessages, isTyping]);

  const callGeminiAPI = async (userMessage) => {
    try {
      const history = catMessages.map(m => ({
        role: m.sender === 'cat' ? 'model' : 'user',
        parts: [{ text: m.text }]
      }));
      
      history.push({ role: 'user', parts: [{ text: userMessage }] });

      const systemInstruction = `Bạn là Mèo Cố Vấn, một người bạn tâm lý học đường trong game 16-bit OVERLOAD. 
Nguyên tắc:
1. Bạn nói chuyện ngắn gọn (tối đa 2-3 câu), thấu cảm, dùng kỹ thuật CBT (Nhận thức hành vi).
2. Xưng hô 'tớ' và 'cậu', thân thiện, thỉnh thoảng chêm từ 'meo'.
3. KHẨN CẤP (QUAN TRỌNG NHẤT): Nếu user nhắc tới ý định TỰ TỬ, TỰ HẠI, hoặc TUYỆT VỌNG CỰC ĐỘ -> BẠN PHẢI LẬP TỨC THOÁT VAI GAME. Đổi xưng hô thành 'Hệ thống'. Khuyên người dùng tìm kiếm sự giúp đỡ ngay lập tức từ người lớn hoặc gọi hotline 111 (Tổng đài Quốc gia Bảo vệ Trẻ em) hoặc 1800599920 (Đường dây nóng hỗ trợ tâm lý). KHÔNG đóng vai mèo nữa.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: { text: systemInstruction } },
          contents: history,
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      
      const text = data.candidates[0].content.parts[0].text;
      addCatMessage('cat', text);
      decreaseStress(10);
    } catch (error) {
      console.error(error);
      const reply = getSmartMockResponse(userMessage);
      addCatMessage('cat', reply);
      decreaseStress(5);
    } finally {
      setIsTyping(false);
    }
  };

  const getSmartMockResponse = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes('mệt') || lower.includes('kiệt sức') || lower.includes('đuối')) {
      return "Meo... Tớ thấy cậu đang gồng gánh nhiều quá. Thử nhắm mắt lại 10 giây xem sao. Cậu đã nghỉ ngơi chút nào trong hôm nay chưa?";
    }
    if (lower.includes('thi') || lower.includes('điểm') || lower.includes('bài tập')) {
      return "Chuyện học hành lúc nào cũng làm tụi mình nghẹt thở nhỉ. Nhưng điểm số không định nghĩa giá trị của cậu đâu meo. Cậu sợ điều gì nhất nếu điểm không như ý?";
    }
    if (lower.includes('buồn') || lower.includes('chán') || lower.includes('tuyệt vọng') || lower.includes('khóc')) {
      return "Lại đây tớ ôm một cái meo! Cảm xúc này rất khó chịu, tớ hiểu mà. Cậu muốn kể chi tiết hơn không, tớ luôn ở đây nghe.";
    }
    if (lower.includes('bố mẹ') || lower.includes('gia đình') || lower.includes('kỳ vọng') || lower.includes('ba mẹ')) {
      return "Sự kỳ vọng đôi khi nặng như một tảng đá. Cậu có nghĩ gia đình biết cậu đang áp lực đến nhường này không?";
    }
    if (lower.includes('áp lực') || lower.includes('stress') || lower.includes('lo')) {
      return "Khi áp lực quá lớn, não bộ tụi mình sẽ tự động hoảng loạn. Hít một hơi thật sâu nào. Có điều gì cậu có thể buông bỏ tạm hôm nay không?";
    }
    
    const genericResponses = [
      "Tớ hiểu. Cảm giác đó thực sự không dễ dàng gì. Cậu đã từng vượt qua chuyện tương tự như thế nào?",
      "Đừng quên cậu không đơn độc. Cậu muốn cùng tớ hít thở sâu một chút không?",
      "Việc cậu dũng cảm tâm sự điều này với tớ đã là một bước tiến lớn rồi đấy meo!",
      "Meo... cậu đang làm rất tốt rồi. Hãy dịu dàng với bản thân mình hơn một chút nhé."
    ];
    return genericResponses[Math.floor(Math.random() * genericResponses.length)];
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const currentInput = input;
    addCatMessage('user', currentInput);
    addJournalEntry(`Tôi đã tâm sự với Mèo: "${currentInput}"`);
    setInput('');
    setIsTyping(true);
    callGeminiAPI(currentInput);
  };

  if (!isLaptopOpen) return null;

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center p-4">
      <div className="modal-overlay absolute inset-0" onClick={closeLaptop}></div>
      
      <div className="modal-content relative flex flex-col fade-in shadow-2xl"
        style={{ 
          width: '500px',
          height: '65vh',
          background: 'var(--color-bg-base)', 
          border: '2px solid var(--color-border-light)',
          borderRadius: '4px'
        }}>
        
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center"
              style={{ 
                width: '32px', height: '32px', 
                background: 'var(--color-bg-surface)', 
                border: '1px solid var(--color-border)',
                borderRadius: '4px'
              }}>
              <span style={{ fontSize: '16px' }}>😸</span>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
            style={{ 
              background: 'var(--color-energy)', 
              border: '2px solid var(--color-bg-base)',
              boxShadow: '0 0 6px var(--color-energy-glow)' 
            }}></span>
            </div>
            <div>
              <h3 className="font-pixel" style={{ fontSize: '9px', color: 'var(--color-text-primary)', letterSpacing: '0.1em' }}>
                MÈO CỐ VẤN
              </h3>
              <p style={{ fontSize: '10px', color: 'var(--color-energy)', fontWeight: 500 }}>
                Trực tuyến · AI
              </p>
            </div>
          </div>
          <button onClick={closeLaptop} className="font-pixel transition-colors hover:text-white"
            style={{ fontSize: '8px', color: 'var(--color-text-muted)', padding: '4px 8px', border: '1px solid var(--color-border)', background: 'var(--color-bg-surface)', cursor: 'pointer' }}>
            ĐÓNG
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-4" style={{ background: '#1e1e28' }}>
        {catMessages.map(msg => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`p-2.5 max-w-[88%] text-sm leading-relaxed ${
              msg.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-cat'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex flex-col items-start">
            <div className="chat-bubble-cat p-3 flex gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--color-text-muted)' }}></span>
              <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--color-text-muted)', animationDelay: '0.15s' }}></span>
              <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--color-text-muted)', animationDelay: '0.3s' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
        </div>

        {/* Safety disclaimer */}
        <div className="px-4 py-1.5" style={{ background: 'var(--color-bg-base)' }}>
          <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
            🤖 AI Cố Vấn - Không lưu trữ hội thoại
          </p>
        </div>

        {/* Input */}
        <div className="p-4" style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}>
          <form onSubmit={handleSend} className="relative flex items-center mb-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Chia sẻ với mèo..." 
            className="w-full py-2.5 pl-3 pr-10 text-sm outline-none"
            style={{
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '2px',
              color: 'var(--color-text-primary)',
              fontSize: '12px'
            }}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-1 transition-colors"
            style={{ color: input.trim() ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
          >
            <Send size={16} />
          </button>
        </form>
        
        {/* Emergency button */}
        <button className="w-full mt-2 py-1.5 text-center transition-colors"
          onClick={() => window.open('tel:1800599920', '_blank')}
          style={{ 
            fontSize: '9px', 
            color: 'var(--color-stress)',
            background: 'hsl(0 75% 60% / 0.08)',
            border: '1px solid hsl(0 75% 60% / 0.2)',
            borderRadius: '2px',
            cursor: 'pointer'
          }}>
          Khẩn cấp? 1800-599-920
        </button>
        </div>
      </div>
    </div>
  );
}

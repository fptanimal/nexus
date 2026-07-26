import eventBus from '../engine/EventBus';
import promptBuilder from './PromptBuilder';
import useGameStore from '../store/useGameStore'; // Temporarily needed for state access

class DiaryService {
  constructor() {
    this._initListeners();
  }

  _initListeners() {
    eventBus.on('DAY_ENDED', () => {
      this.generateDailyEntry();
    });
  }

  async generateDailyEntry() {
    const history = []; // Mock
    const mood = 'busy'; // Mock
    
    const prompt = promptBuilder.buildDiaryPrompt(history, mood);
    console.log("[DiaryService] Generating diary for prompt:", prompt);
    
    // Mock response:
    setTimeout(() => {
      const entryText = "Hôm nay lại là một ngày dài. Mình đã cố gắng học nhưng sách vở cứ như một đống hỗn độn trước mắt...";
      eventBus.emit('DIARY_ENTRY_CREATED', entryText);
    }, 1500);
  }
}

export default new DiaryService();

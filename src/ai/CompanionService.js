import eventBus from '../engine/EventBus';
import promptBuilder from './PromptBuilder';

class CompanionService {
  constructor() {
    this._initListeners();
  }

  _initListeners() {
    // Companion listens for specific events to potentially chime in
    eventBus.on('MOOD_CHANGED', (newMood) => {
      if (newMood === 'burnout' || newMood === 'overwhelmed') {
        this.triggerCompanionCheckIn(newMood);
      }
    });
  }

  async triggerCompanionCheckIn(mood) {
    // Example: fetch history from a future HistoryManager, for now mock it
    const history = [{ action: "Thức khuya" }, { action: "Điểm thấp" }];
    const prompt = promptBuilder.buildCompanionPrompt(history, mood, 'Cảm thấy áp lực');
    
    // TODO: Send prompt to Gemini API
    console.log("[CompanionService] Fetching response for prompt:", prompt);
    // Mock response:
    setTimeout(() => {
      const response = "Cậu nghỉ một lát đi, uống cốc nước cho đỡ mệt nhé.";
      eventBus.emit('COMPANION_MESSAGE', { sender: 'cat', text: response });
    }, 1000);
  }
}

export default new CompanionService();

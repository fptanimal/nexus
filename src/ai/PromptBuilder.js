class PromptBuilder {
  /**
   * Summarizes raw history into a short prompt segment to save tokens.
   */
  summarizeHistory(logs) {
    if (!logs || logs.length === 0) return "Không có hoạt động nào.";
    // TODO: Connect to an actual LLM summarizer if needed, 
    // or just use rule-based aggregation for now to save API calls.
    const uniqueActions = [...new Set(logs.map(l => l.action))];
    return `Người chơi gần đây đã làm: ${uniqueActions.join(', ')}.`;
  }

  buildCompanionPrompt(history, currentMood, currentEvent) {
    const summary = this.summarizeHistory(history);
    return `
      Bạn là một chú mèo AI đồng hành. Tâm trạng của người chơi đang: ${currentMood}.
      Lịch sử gần đây: ${summary}.
      Sự kiện hiện tại: ${currentEvent}.
      Hãy đưa ra một câu nói ngắn (dưới 20 chữ), tự nhiên, quan tâm người chơi.
    `;
  }

  buildDiaryPrompt(history, mood) {
    const summary = this.summarizeHistory(history);
    return `
      Viết 1 đoạn nhật ký ngắn (dưới 50 chữ) dưới góc nhìn ngôi thứ nhất ("mình").
      Tâm trạng hôm nay: ${mood}.
      Sự kiện trong ngày: ${summary}.
      Không cần ghi ngày tháng, hãy viết thật cảm xúc như một học sinh đang chịu áp lực học hành (Expressive Writing).
    `;
  }
}

export default new PromptBuilder();

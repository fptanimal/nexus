import eventBus from '../engine/EventBus';

class MoodManager {
  constructor() {
    this.currentMood = 'calm';
    this._initListeners();
  }

  _initListeners() {
    eventBus.on('STATS_CHANGED', (stats) => {
      this.recalculateMood(stats);
    });
  }

  recalculateMood(stats) {
    const { stress = 0, energy = 100, selfEsteem = 100 } = stats;
    let newMood = 'calm';
    
    // Simple hierarchical mood determination
    if (stress > 85 || energy < 20 || selfEsteem < 20) {
      newMood = 'burnout';
    } else if (stress > 60 || selfEsteem < 50) {
      newMood = 'overwhelmed';
    } else if (stress > 30) {
      newMood = 'busy';
    }

    if (this.currentMood !== newMood) {
      this.currentMood = newMood;
      eventBus.emit('MOOD_CHANGED', newMood);
    }
  }
  
  getMood() {
      return this.currentMood;
  }
}

export default new MoodManager();

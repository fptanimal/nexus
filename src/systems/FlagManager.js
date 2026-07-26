import eventBus from '../engine/EventBus';
import flagsConfig from '../config/StoryFlags.json';

class FlagManager {
  constructor() {
    this.flags = { ...flagsConfig.initialState };
    this._initListeners();
  }

  _initListeners() {
    eventBus.on('EXAM_SCORED', (score) => {
      this.setFlag('mathExamScore', score);
    });
    
    eventBus.on('DAY_ENDED', (stats) => {
      if (stats && stats.sleptBeforeMidnight) {
        this.setFlag('sleepEarlyDays', this.getFlag('sleepEarlyDays') + 1);
      } else {
        this.setFlag('sleepEarlyDays', 0); // Reset combo
      }
    });
  }

  getFlag(key) {
    return this.flags[key];
  }

  setFlag(key, value) {
    this.flags[key] = value;
    eventBus.emit('FLAG_CHANGED', { key, value });
  }

  getAllFlags() {
    return this.flags;
  }
  
  loadState(savedFlags) {
      this.flags = { ...this.flags, ...savedFlags };
  }
}

export default new FlagManager();

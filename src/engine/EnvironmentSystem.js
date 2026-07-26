import eventBus from './EventBus';
import envConfig from '../config/Environment.json';

class EnvironmentSystem {
  constructor() {
    this.currentEnv = envConfig.chapters["0"];
    this._initListeners();
  }

  _initListeners() {
    eventBus.on('MOOD_CHANGED', (mood) => {
      this.updateEnvironment(null, mood);
    });
    
    // Listen to chapter changes if we ever fire them, 
    // or we can explicitly set chapter.
  }

  updateEnvironment(chapter = "0", mood = "calm") {
    let base = envConfig.chapters[chapter] || envConfig.chapters["0"];
    
    // Apply mood overrides
    if (envConfig.mood_overrides[mood]) {
      base = { ...base, ...envConfig.mood_overrides[mood] };
    }

    this.currentEnv = base;
    eventBus.emit('ENVIRONMENT_UPDATED', this.currentEnv);
  }

  getCurrentEnvironment() {
    return this.currentEnv;
  }
}

export default new EnvironmentSystem();

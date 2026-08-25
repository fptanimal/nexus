// Web Audio API Synthesizer & Generative Ambient Engine
// Zero external dependencies, pure 8-bit / Lo-Fi sound synthesis

class AudioSystem {
  constructor() {
    this.ctx = null;
    this.sfxGain = null;
    this.isMuted = false;
    this.bgmVolume = 0.25;
    this.sfxVolume = 0.4;
    this.isPlayingBGM = false;
    this.currentTrackIndex = 0;
    this.tracks = ['/audio/piano1.mp3', '/audio/piano2.mp3', '/audio/piano3.mp3'];
    
    // HTML5 Audio for BGM
    this.bgmAudio = new Audio(this.tracks[this.currentTrackIndex]);
    this.bgmAudio.loop = true;
    this.bgmAudio.volume = this.bgmVolume;
  }

  // Initialize AudioContext on user interaction
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master SFX Gain
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxVolume;
      this.sfxGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMute(mute) {
    this.isMuted = mute;
    this.bgmAudio.muted = mute;
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.sfxGain.gain.setTargetAtTime(this.isMuted ? 0 : this.sfxVolume, now, 0.05);
  }

  setBgmVolume(vol) {
    this.bgmVolume = vol;
    this.bgmAudio.volume = vol;
  }

  setSfxVolume(vol) {
    this.sfxVolume = vol;
    if (!this.ctx || this.isMuted) return;
    this.sfxGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.05);
  }

  nextTrack() {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
    this.playTrack(this.currentTrackIndex);
    return this.currentTrackIndex;
  }

  prevTrack() {
    this.currentTrackIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
    this.playTrack(this.currentTrackIndex);
    return this.currentTrackIndex;
  }

  playTrack(index) {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio.src = this.tracks[index];
      this.bgmAudio.load();
      if (!this.isMuted) this.bgmAudio.play().catch(e => console.warn(e));
    }
  }

  // ── SOUND EFFECTS (SFX) ───────────────────────────────────

  // Healing Menu Click (Soft Chime/Bloop)
  playClick() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.08); // G5

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  // 8-bit Step Sound (soft low pulse)
  playStep() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.03);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.035);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Typewriter bleep (NPC / Cat dialogue)
  playTypewriter() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    // Slight random pitch for natural Gameboy dialogue feel
    const freq = 600 + Math.random() * 250;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.005, now + 0.025);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  // Healing / Chime (Breathing, Grounding, Watering plant)
  playChime() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.2, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.45);
    });
  }

  // Error / Warning sound
  playError() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.setValueAtTime(100, now + 0.08);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  // School Bell (Ding-dong-ding-dong)
  playSchoolBell() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    
    // Westminister Quarters pattern notes
    const notes = [
      { freq: 659.25, time: 0 }, // E5
      { freq: 523.25, time: 0.5 }, // C5
      { freq: 587.33, time: 1.0 }, // D5
      { freq: 392.00, time: 1.5 }, // G4
      { freq: 392.00, time: 2.5 }, // G4
      { freq: 587.33, time: 3.0 }, // D5
      { freq: 659.25, time: 3.5 }, // E5
      { freq: 523.25, time: 4.0 }  // C5
    ];

    notes.forEach(note => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, now + note.time);

      // Bell envelope
      gain.gain.setValueAtTime(0, now + note.time);
      gain.gain.linearRampToValueAtTime(0.6, now + note.time + 0.05); // Sharp attack
      gain.gain.exponentialRampToValueAtTime(0.01, now + note.time + 2.0); // Long decay

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + note.time);
      osc.stop(now + note.time + 2.5);
    });
  }

  // ── MP3 BGM ENGINE ─────────────────────────

  startBGM(index = null) {
    if (index !== null) {
      this.currentTrackIndex = index;
      this.bgmAudio.src = this.tracks[this.currentTrackIndex];
    }
    if (!this.isMuted) this.bgmAudio.play().catch(e => console.warn('BGM play prevented:', e));
    this.isPlayingBGM = true;
  }

  stopBGM() {
    this.bgmAudio.pause();
    this.isPlayingBGM = false;
  }

  nextTrack() {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
    this.bgmAudio.src = this.tracks[this.currentTrackIndex];
    if (this.isPlayingBGM) {
      this.bgmAudio.play().catch(e => console.warn(e));
    }
    return this.currentTrackIndex;
  }

  prevTrack() {
    this.currentTrackIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
    this.bgmAudio.src = this.tracks[this.currentTrackIndex];
    if (this.isPlayingBGM) {
      this.bgmAudio.play().catch(e => console.warn(e));
    }
    return this.currentTrackIndex;
  }

  updateVibe(location, stress) {
    this.currentLocation = location;
    this.stressLevel = stress;
  }
}

const audioSystem = new AudioSystem();
export default audioSystem;

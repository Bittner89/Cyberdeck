class AudioService {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isPlaying = false;
    this.tempo = 115;
    this.nextNoteTime = 0;
    this.beat = 0;
    this.lookahead = 25;
    this.scheduleAhead = 0.1;
    this.timer = null;
    this.volume = 0.2; // Standardlautstärke
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.volume;
    this.masterGain.connect(this.ctx.destination);
  }

  setMasterVolume(val) {
    this.volume = val;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(val, this.ctx.currentTime, 0.05);
    }
  }

  playFX(type) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(this.masterGain); // An MasterGain statt Destination

    switch (type) {
      case "select":
        osc.type = "square";
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        gainNode.gain.setValueAtTime(0.05, this.ctx.currentTime);
        osc.start(); osc.stop(this.ctx.currentTime + 0.05);
        break;
      case "confirm":
        osc.type = "sine";
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, this.ctx.currentTime);
        osc.start(); osc.stop(this.ctx.currentTime + 0.1);
        break;
      case "crash":
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(100, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.2, this.ctx.currentTime);
        osc.start(); osc.stop(this.ctx.currentTime + 0.3);
        break;
      case "score":
        osc.type = "triangle";
        osc.frequency.setValueAtTime(600, this.ctx.currentTime);
        gainNode.gain.setValueAtTime(0.05, this.ctx.currentTime);
        osc.start(); osc.stop(this.ctx.currentTime + 0.1);
        break;
    }
  }

  // ... (Rest der MusicEngine bleibt gleich wie vorher)
  startMusic() {
    if (this.isPlaying) return;
    this.init();
    this.isPlaying = true;
    this.nextNoteTime = this.ctx.currentTime + 0.1;
    this.beat = 0;
    this.scheduler();
  }

  stopMusic() {
    this.isPlaying = false;
    clearTimeout(this.timer);
  }

  scheduler() {
    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAhead) {
      this.playStep(this.nextNoteTime);
      const secondsPerBeat = 60.0 / this.tempo;
      this.nextNoteTime += 0.25 * secondsPerBeat;
      this.beat = (this.beat + 1) % 16;
    }
    if (this.isPlaying) this.timer = setTimeout(() => this.scheduler(), this.lookahead);
  }

  playStep(t) {
    if (this.beat % 4 === 0) this.kick(t);
    if (this.beat % 2 !== 0) this.hihat(t);
    if (this.beat === 4 || this.beat === 12) this.snare(t);
    const bassSeq = [36, 36, 39, 36, 36, 36, 41, 39];
    if (this.beat % 2 === 0) this.bass(t, this.midiToFreq(bassSeq[(this.beat / 2) % bassSeq.length]));
    if (Math.random() > 0.7) {
      const scale = [60, 63, 65, 67, 70, 72];
      this.arp(t, this.midiToFreq(scale[Math.floor(Math.random() * scale.length)]));
    }
  }

  kick(t) {
    const osc = this.ctx.createOscillator(), g = this.ctx.createGain();
    osc.connect(g); g.connect(this.masterGain);
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.5);
    g.gain.setValueAtTime(1, t);
    g.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
    osc.start(t); osc.stop(t + 0.5);
  }

  snare(t) {
    const osc = this.ctx.createOscillator(), g = this.ctx.createGain();
    osc.type = "triangle"; osc.connect(g); g.connect(this.masterGain);
    osc.frequency.setValueAtTime(250, t);
    g.gain.setValueAtTime(0.6, t);
    g.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    osc.start(t); osc.stop(t + 0.2);
  }

  hihat(t) {
    const osc = this.ctx.createOscillator(), g = this.ctx.createGain(), f = this.ctx.createBiquadFilter();
    osc.type = "square"; f.type = "highpass"; f.frequency.value = 8000;
    osc.connect(f); f.connect(g); g.connect(this.masterGain);
    g.gain.setValueAtTime(0.15, t);
    g.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
    osc.start(t); osc.stop(t + 0.05);
  }

  bass(t, f) {
    const osc = this.ctx.createOscillator(), g = this.ctx.createGain(), filt = this.ctx.createBiquadFilter();
    osc.type = "sawtooth"; osc.frequency.value = f;
    filt.type = "lowpass"; filt.frequency.setValueAtTime(100, t);
    filt.frequency.linearRampToValueAtTime(800, t + 0.1);
    filt.frequency.linearRampToValueAtTime(100, t + 0.2);
    osc.connect(filt); filt.connect(g); g.connect(this.masterGain);
    g.gain.setValueAtTime(0.6, t);
    g.gain.linearRampToValueAtTime(0.01, t + 0.25);
    osc.start(t); osc.stop(t + 0.25);
  }

  arp(t, f) {
    const osc = this.ctx.createOscillator(), g = this.ctx.createGain();
    osc.type = "square"; osc.frequency.value = f;
    osc.connect(g); g.connect(this.masterGain);
    g.gain.setValueAtTime(0.08, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.start(t); osc.stop(t + 0.1);
  }

  midiToFreq(n) { return 440 * Math.pow(2, (n - 69) / 12); }
}

export const audioService = new AudioService();
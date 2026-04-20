class AudioService {
  constructor() {
    const savedVol = localStorage.getItem('nexus_volume');
    const savedMute = localStorage.getItem('nexus_muted');

    this.ctx = null;
    this.masterGain = null;
    this.isPlaying = false;
    this.tempo = 118; 
    this.nextNoteTime = 0;
    this.beat = 0;
    this.loopCount = 0; 
    this.lookahead = 25;
    this.scheduleAhead = 0.1;
    this.timer = null;

    this.volume = savedVol !== null ? parseFloat(savedVol) : 0.2;
    this.isMuted = savedMute === 'true';
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.isMuted ? 0 : this.volume;
    this.masterGain.connect(this.ctx.destination);
  }

  // --- FX SEKTION (Stabil & Sicher) ---
  playFX(type) {
    if (this.isMuted || !this.ctx) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.connect(g); g.connect(this.masterGain);
    switch (type) {
      case "eat":
      case "select":
        osc.type = "square";
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(500, this.ctx.currentTime + 0.1);
        g.gain.setValueAtTime(0.05, this.ctx.currentTime);
        osc.start(); osc.stop(this.ctx.currentTime + 0.1);
        break;
      case "score":
        osc.type = "triangle";
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.1);
        g.gain.setValueAtTime(0.06, this.ctx.currentTime);
        osc.start(); osc.stop(this.ctx.currentTime + 0.1);
        break;
      default:
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, this.ctx.currentTime);
        g.gain.setValueAtTime(0.05, this.ctx.currentTime);
        osc.start(); osc.stop(this.ctx.currentTime + 0.05);
    }
  }

  startMusic() {
    if (this.isPlaying) return;
    this.init();
    this.isPlaying = true;
    this.nextNoteTime = this.ctx.currentTime + 0.1;
    this.beat = 0;
    this.loopCount = 0;
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
      this.beat++;
      if (this.beat >= 32) {
        this.beat = 0;
        this.loopCount = (this.loopCount + 1) % 3; // A-B-C Cycle
      }
    }
    if (this.isPlaying) this.timer = setTimeout(() => this.scheduler(), this.lookahead);
  }

  playStep(t) {
    if (this.isMuted) return;

    // --- PERKUSSION (Bleibt jetzt durchgehend aktiver) ---
    if (this.beat % 4 === 0) this.kick(t);
    // In C lassen wir nur die Snare weg, behalten aber den Drive
    if (this.loopCount !== 2 && this.beat % 8 === 4) this.snare(t);
    if (this.beat % 2 !== 0) this.hihat(t);

    if (this.loopCount === 0) {
      // --- DAS NEUE THEMA A (Ehemals D - Der Drive) ---
      const bassA = [36, 36, 38, 38, 39, 39, 41, 41];
      this.bass(t, this.midiToFreq(bassA[Math.floor(this.beat / 4) % 8]), false);
      
      if (this.beat % 2 === 0) {
        // Schnelle 16tel Arps für technoiden Vibe
        this.arp(t, this.midiToFreq(60 + (this.beat % 4)), 0.2);
      }
    } 
    else if (this.loopCount === 1) {
      // --- THEMA B (DEIN FAVORIT) ---
      const bassB = [32, 32, 34, 34, 29, 29, 31, 31];
      this.bass(t, this.midiToFreq(bassB[Math.floor(this.beat / 4) % 8]), true); 

      const leadB = [72, 75, 79, 84, 82, 79, 75, 72];
      if (this.beat % 4 === 0) {
        this.arp(t, this.midiToFreq(leadB[(this.beat / 4) % 8]), 1.2); 
      }
    }
    else {
      // --- DAS NEUE THEMA C (Transit ohne Tempo-Verlust) ---
      // Bass bleibt aktiv auf einer Note, um Druck zu halten
      this.bass(t, this.midiToFreq(36), false);
      
      if (this.beat % 4 === 2) {
        // Akzentuierte Off-Beat Noten
        this.arp(t, this.midiToFreq(72), 0.4);
      }
    }
  }

  // --- SYNTH ENGINES (Konsistent gehalten) ---
  kick(t) {
    const osc = this.ctx.createOscillator(), g = this.ctx.createGain();
    osc.connect(g); g.connect(this.masterGain);
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.15);
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.start(t); osc.stop(t + 0.2);
  }

  snare(t) {
    const osc = this.ctx.createOscillator(), g = this.ctx.createGain();
    osc.type = "triangle"; osc.connect(g); g.connect(this.masterGain);
    osc.frequency.setValueAtTime(180, t);
    g.gain.setValueAtTime(0.15, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.start(t); osc.stop(t + 0.1);
  }

  hihat(t) {
    const osc = this.ctx.createOscillator(), g = this.ctx.createGain(), f = this.ctx.createBiquadFilter();
    osc.type = "square"; f.type = "highpass"; f.frequency.value = 9000;
    osc.connect(f); f.connect(g); g.connect(this.masterGain);
    g.gain.setValueAtTime(0.03, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
    osc.start(t); osc.stop(t + 0.02);
  }

  bass(t, f, aggressive = false) {
    const osc1 = this.ctx.createOscillator(), osc2 = this.ctx.createOscillator();
    const g = this.ctx.createGain(), filt = this.ctx.createBiquadFilter();
    osc1.type = "sawtooth"; osc1.frequency.value = f;
    osc2.type = "sawtooth"; osc2.frequency.value = f * 1.01; 
    filt.type = "lowpass"; 
    filt.frequency.setValueAtTime(aggressive ? 900 : 300, t);
    filt.frequency.exponentialRampToValueAtTime(aggressive ? 300 : 600, t + 0.15); 
    osc1.connect(filt); osc2.connect(filt);
    filt.connect(g); g.connect(this.masterGain);
    g.gain.setValueAtTime(aggressive ? 0.2 : 0.12, t);
    g.gain.linearRampToValueAtTime(0.001, t + 0.25);
    osc1.start(t); osc2.start(t);
    osc1.stop(t + 0.25); osc2.stop(t + 0.25);
  }

  arp(t, f, decayMult = 1.0) {
    const osc = this.ctx.createOscillator(), g = this.ctx.createGain(), filt = this.ctx.createBiquadFilter();
    osc.type = "square";
    osc.frequency.setValueAtTime(f, t);
    filt.type = "bandpass";
    filt.frequency.value = 1200;
    osc.connect(filt); filt.connect(g); g.connect(this.masterGain);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.04, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + (0.6 * decayMult)); 
    osc.start(t); osc.stop(t + (0.6 * decayMult));
  }

  midiToFreq(n) { return 440 * Math.pow(2, (n - 69) / 12); }
  setMasterVolume(val) { this.volume = val; if(this.masterGain) this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : val, this.ctx.currentTime, 0.05); }
  setMuted(m) { this.isMuted = m; if(this.masterGain) this.masterGain.gain.setTargetAtTime(m ? 0 : this.volume, this.ctx.currentTime, 0.05); }
}

export const audioService = new AudioService();
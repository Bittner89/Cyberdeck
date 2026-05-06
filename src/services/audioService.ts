import snakeMusicFile from '../components/mp3/Neon_Coil.mp3';
import tetrisMusicFile from '../components/mp3/Neon_Block_Drop.mp3';
import breakoutMusicFile from '../components/mp3/neon_paddle_run.mp3';
import spaceInvadersMusicFile from '../components/mp3/Neon_Invader_Grid.mp3';

class AudioService {
  ctx: AudioContext | null;
  masterGain: GainNode | null;
  isPlaying: boolean;
  tempo: number;
  nextNoteTime: number;
  beat: number;
  loopCount: number;
  lookahead: number;
  scheduleAhead: number;
  timer: ReturnType<typeof setTimeout> | null;
  volume: number;
  isMuted: boolean;
  currentGame: string;
  bgMusicElement: HTMLAudioElement | null;
  tetrisBgMusicElement: HTMLAudioElement | null;
  breakoutBgMusicElement: HTMLAudioElement | null;
  spaceInvadersBgMusicElement: HTMLAudioElement | null;

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
    this.currentGame = 'default';
    this.bgMusicElement = new Audio(snakeMusicFile);
    this.bgMusicElement.loop = true;

    this.tetrisBgMusicElement = new Audio(tetrisMusicFile);
    this.tetrisBgMusicElement.loop = true;

    this.breakoutBgMusicElement = new Audio(breakoutMusicFile);
    this.breakoutBgMusicElement.loop = true;

    this.spaceInvadersBgMusicElement = new Audio(spaceInvadersMusicFile);
    this.spaceInvadersBgMusicElement.loop = true;

    this.volume = savedVol !== null ? parseFloat(savedVol) : 0.2;
    this.isMuted = savedMute === 'true';
    
    this.bgMusicElement.volume = this.volume;
    this.bgMusicElement.muted = this.isMuted;
    this.tetrisBgMusicElement.volume = this.volume;
    this.tetrisBgMusicElement.muted = this.isMuted;
    this.breakoutBgMusicElement.volume = this.volume;
    this.breakoutBgMusicElement.muted = this.isMuted;
    this.spaceInvadersBgMusicElement.volume = this.volume;
    this.spaceInvadersBgMusicElement.muted = this.isMuted;
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.isMuted ? 0 : this.volume;
    this.masterGain.connect(this.ctx.destination);
  }

  // --- FX SEKTION (Stabil & Sicher) ---
  playFX(type: string) {
    if (this.isMuted || !this.ctx) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
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

  startMusic(game: string = 'default') {
    if (this.isPlaying && this.currentGame === game) return;
    this.stopMusic();
    this.init();
    if (!this.ctx) return;
    this.currentGame = game;
    this.isPlaying = true;

    if (game === 'snake') {
      if (this.bgMusicElement) {
        this.bgMusicElement.currentTime = 0;
        this.bgMusicElement.play().catch(e => console.error("Audio playback error:", e));
      }
      return; // Skip procedural music
    }

    if (game === 'tetris') {
      if (this.tetrisBgMusicElement) {
        this.tetrisBgMusicElement.currentTime = 0;
        this.tetrisBgMusicElement.play().catch(e => console.error("Audio playback error:", e));
      }
      return; // Skip procedural music
    }

    if (game === 'breakout') {
      if (this.breakoutBgMusicElement) {
        this.breakoutBgMusicElement.currentTime = 0;
        this.breakoutBgMusicElement.play().catch(e => console.error("Audio playback error:", e));
      }
      return; // Skip procedural music
    }

    if (game === 'spaceinvaders') {
      if (this.spaceInvadersBgMusicElement) {
        this.spaceInvadersBgMusicElement.currentTime = 0;
        this.spaceInvadersBgMusicElement.play().catch(e => console.error("Audio playback error:", e));
      }
      return; // Skip procedural music
    }

    this.nextNoteTime = this.ctx.currentTime + 0.1;
    this.beat = 0;
    this.loopCount = 0;

    // Dynamisches Tempo je nach Spiel
    switch(game) {
      default: this.tempo = 118; break;
    }

    this.scheduler();
  }

  stopMusic() {
    this.isPlaying = false;
    if (this.timer) clearTimeout(this.timer);
    if (this.bgMusicElement) {
      this.bgMusicElement.pause();
      this.bgMusicElement.currentTime = 0;
    }
    if (this.tetrisBgMusicElement) {
      this.tetrisBgMusicElement.pause();
      this.tetrisBgMusicElement.currentTime = 0;
    }
    if (this.breakoutBgMusicElement) {
      this.breakoutBgMusicElement.pause();
      this.breakoutBgMusicElement.currentTime = 0;
    }
    if (this.spaceInvadersBgMusicElement) {
      this.spaceInvadersBgMusicElement.pause();
      this.spaceInvadersBgMusicElement.currentTime = 0;
    }
  }

  pauseMusic() {
    this.isPlaying = false;
    if (this.timer) clearTimeout(this.timer);
    if (this.bgMusicElement && !this.bgMusicElement.paused) {
      this.bgMusicElement.pause();
    }
    if (this.tetrisBgMusicElement && !this.tetrisBgMusicElement.paused) {
      this.tetrisBgMusicElement.pause();
    }
    if (this.breakoutBgMusicElement && !this.breakoutBgMusicElement.paused) {
      this.breakoutBgMusicElement.pause();
    }
    if (this.spaceInvadersBgMusicElement && !this.spaceInvadersBgMusicElement.paused) {
      this.spaceInvadersBgMusicElement.pause();
    }
  }

  resumeMusic() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    if (this.currentGame === 'snake') {
      if (this.bgMusicElement) this.bgMusicElement.play().catch(e => console.error("Audio playback error:", e));
    } else if (this.currentGame === 'tetris') {
      if (this.tetrisBgMusicElement) this.tetrisBgMusicElement.play().catch(e => console.error("Audio playback error:", e));
    } else if (this.currentGame === 'breakout') {
      if (this.breakoutBgMusicElement) this.breakoutBgMusicElement.play().catch(e => console.error("Audio playback error:", e));
    } else if (this.currentGame === 'spaceinvaders') {
      if (this.spaceInvadersBgMusicElement) this.spaceInvadersBgMusicElement.play().catch(e => console.error("Audio playback error:", e));
    } else {
      this.nextNoteTime = this.ctx?.currentTime ? this.ctx.currentTime + 0.1 : 0;
      this.scheduler();
    }
  }

  scheduler() {
    if (!this.ctx) return;
    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAhead) {
      this.playStep(this.nextNoteTime);
      const secondsPerBeat = 60.0 / this.tempo;
      this.nextNoteTime += 0.25 * secondsPerBeat;
      this.beat++;
      if (this.beat >= 64) {
        this.beat = 0;
        this.loopCount = (this.loopCount + 1) % 4; // A-B-C-D Cycle
      }
    }
    if (this.isPlaying) this.timer = setTimeout(() => this.scheduler(), this.lookahead);
  }

  playStep(t: number) {
    if (this.isMuted) return;

    const game = this.currentGame;

    if (game === 'breakout') {
      if (this.beat % 4 === 0) this.kick(t);
      if (this.beat % 2 !== 0) this.hihat(t);
      if (this.beat % 4 === 2) this.snare(t);

      const part = this.loopCount % 2;
      if (part === 0) {
        const arpLine = [60, 72, 60, 75, 60, 72, 60, 79];
        this.arp(t, this.midiToFreq(arpLine[this.beat % 8]), 0.3);
        if (this.beat % 4 === 0) this.bass(t, this.midiToFreq(36), false);
      } else {
        const arpLine = [64, 76, 64, 79, 64, 76, 64, 81];
        this.arp(t, this.midiToFreq(arpLine[this.beat % 8]), 0.3);
        if (this.beat % 4 === 0) this.bass(t, this.midiToFreq(40), false);
      }
      
      // Add a chord stab in the second half
      if (this.loopCount >= 2 && this.beat % 16 === 0) {
        this.arp(t, this.midiToFreq(72), 2.0);
        this.arp(t, this.midiToFreq(76), 2.0);
        this.arp(t, this.midiToFreq(79), 2.0);
      }
    }
    else {
      // DEFAULT / MENU (Dein bisheriger Track)
      if (this.beat % 4 === 0) this.kick(t);
      if (this.loopCount !== 3 && this.beat % 8 === 4) this.snare(t);
      if (this.beat % 2 !== 0) this.hihat(t);

      if (this.loopCount === 0) {
        const bassA = [36, 36, 38, 38, 39, 39, 41, 41];
        this.bass(t, this.midiToFreq(bassA[Math.floor(this.beat / 2) % 8]), false);
        if (this.beat % 2 === 0) this.arp(t, this.midiToFreq(60 + (this.beat % 4)), 0.2);
      } else if (this.loopCount === 1) {
        const bassB = [32, 32, 34, 34, 29, 29, 31, 31];
        this.bass(t, this.midiToFreq(bassB[Math.floor(this.beat / 2) % 8]), true); 
        const leadB = [72, 75, 79, 84, 82, 79, 75, 72];
        if (this.beat % 4 === 0) this.arp(t, this.midiToFreq(leadB[(this.beat / 4) % 8]), 1.2); 
      } else if (this.loopCount === 2) {
        this.bass(t, this.midiToFreq(36), false);
        if (this.beat % 4 === 2) this.arp(t, this.midiToFreq(72), 0.4);
      } else {
        if (this.beat % 16 === 0) this.bass(t, this.midiToFreq(29), true);
        if (this.beat % 8 === 0) this.arp(t, this.midiToFreq(84), 2.0);
      }
    }
  }

  // --- SYNTH ENGINES (Konsistent gehalten) ---
  kick(t: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator(), g = this.ctx.createGain();
    osc.connect(g); g.connect(this.masterGain);
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.15);
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.start(t); osc.stop(t + 0.2);
  }

  snare(t: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator(), g = this.ctx.createGain();
    osc.type = "triangle"; osc.connect(g); g.connect(this.masterGain);
    osc.frequency.setValueAtTime(180, t);
    g.gain.setValueAtTime(0.15, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.start(t); osc.stop(t + 0.1);
  }

  hihat(t: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator(), g = this.ctx.createGain(), f = this.ctx.createBiquadFilter();
    osc.type = "square"; f.type = "highpass"; f.frequency.value = 9000;
    osc.connect(f); f.connect(g); g.connect(this.masterGain);
    g.gain.setValueAtTime(0.03, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
    osc.start(t); osc.stop(t + 0.02);
  }

  bass(t: number, f: number, aggressive: boolean = false) {
    if (!this.ctx || !this.masterGain) return;
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

  arp(t: number, f: number, decayMult: number = 1.0) {
    if (!this.ctx || !this.masterGain) return;
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

  midiToFreq(n: number) { return 440 * Math.pow(2, (n - 69) / 12); }
  setMasterVolume(val: number) { 
    this.volume = val; 
    if(this.masterGain && this.ctx) this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : val, this.ctx.currentTime, 0.05); 
    if(this.bgMusicElement) this.bgMusicElement.volume = val;
    if(this.tetrisBgMusicElement) this.tetrisBgMusicElement.volume = val;
    if(this.breakoutBgMusicElement) this.breakoutBgMusicElement.volume = val;
    if(this.spaceInvadersBgMusicElement) this.spaceInvadersBgMusicElement.volume = val;
  }
  setMuted(m: boolean) { 
    this.isMuted = m; 
    if(this.masterGain && this.ctx) this.masterGain.gain.setTargetAtTime(m ? 0 : this.volume, this.ctx.currentTime, 0.05); 
    if(this.bgMusicElement) this.bgMusicElement.muted = m;
    if(this.tetrisBgMusicElement) this.tetrisBgMusicElement.muted = m;
    if(this.breakoutBgMusicElement) this.breakoutBgMusicElement.muted = m;
    if(this.spaceInvadersBgMusicElement) this.spaceInvadersBgMusicElement.muted = m;
  }
}

export const audioService = new AudioService();
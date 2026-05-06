import { useState, useEffect, useCallback, useRef } from 'react';
import { audioService } from '../../services/audioService';

export interface Enemy {
  id: number;
  x: number;
  y: number;
  alive: boolean;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export interface Ufo {
  active: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  dir: number;
}

export interface Projectile {
  id: number;
  x: number;
  y: number;
  isPlayer: boolean;
}

export function useSpaceInvadersLogic(canvasWidth: number, canvasHeight: number) {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);

  const playerWidth = 40;
  const playerHeight = 20;
  const enemyWidth = 30;
  const enemyHeight = 30;
  const projWidth = 4;
  const projHeight = 15;

  const state = useRef({
    playerX: canvasWidth / 2 - playerWidth / 2,
    enemies: [] as Enemy[],
    projectiles: [] as Projectile[],
    enemyDir: 1, 
    lastShot: 0,
    keys: { ArrowLeft: false, ArrowRight: false, " ": false },
    projIdCounter: 0,
    enemySpeed: 1.5,
    lastEnemyMove: 0,
    particles: [] as Particle[],
    particleIdCounter: 0,
    ufo: { active: false, x: 0, y: 20, width: 45, height: 18, dir: 1 } as Ufo
  });

  const spawnEnemies = useCallback(() => {
    const newEnemies = [];
    let id = 0;
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 11; col++) {
        newEnemies.push({
          id: id++,
          x: 100 + col * 50,
          y: 50 + row * 40,
          alive: true
        });
      }
    }
    state.current.enemies = newEnemies;
  }, []);

  const resetGame = useCallback(() => {
    setScore(0);
    setGameOver(false);
    setIsPaused(true);
    state.current = {
      playerX: canvasWidth / 2 - playerWidth / 2,
      enemies: [],
      projectiles: [],
      enemyDir: 1,
      lastShot: 0,
      keys: { ArrowLeft: false, ArrowRight: false, " ": false },
      projIdCounter: 0,
      enemySpeed: 1.5,
      lastEnemyMove: 0,
      particles: [],
      particleIdCounter: 0,
      ufo: { active: false, x: 0, y: 20, width: 45, height: 18, dir: 1 }
    };
    spawnEnemies();
  }, [canvasWidth, spawnEnemies]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (state.current.keys.hasOwnProperty(e.key)) {
      state.current.keys[e.key as keyof typeof state.current.keys] = true;
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (state.current.keys.hasOwnProperty(e.key)) {
      state.current.keys[e.key as keyof typeof state.current.keys] = false;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const update = useCallback((time: number) => {
    if (gameOver || isPaused) return;

    const s = state.current;
    
    // Update Player
    let isMoving = false;
    if (s.keys.ArrowLeft) { s.playerX -= 5; isMoving = true; }
    if (s.keys.ArrowRight) { s.playerX += 5; isMoving = true; }
    s.playerX = Math.max(0, Math.min(canvasWidth - playerWidth, s.playerX));

    // Triebwerk Partikel (Engine Exhaust)
    if (isMoving && Math.random() < 0.8) {
      s.particles.push({
        id: s.particleIdCounter++,
        x: s.playerX + playerWidth / 2 + (Math.random() - 0.5) * 12,
        y: canvasHeight - 20, // Startet genau am unteren Rand des Spielers
        vx: (Math.random() - 0.5) * 1.5,
        vy: 2 + Math.random() * 2, // Fällt schnell nach unten
        life: 1.0,
        color: '#00ffff'
      });
    }

    // Shoot Projectile
    if (s.keys[" "] && time - s.lastShot > 300) {
      s.projectiles.push({
        id: s.projIdCounter++,
        x: s.playerX + playerWidth / 2 - projWidth / 2,
        y: canvasHeight - 40 - projHeight,
        isPlayer: true
      });
      s.lastShot = time;
      audioService.playFX('select'); 
    }

    // Move Projectiles
    s.projectiles.forEach(p => {
      p.y += p.isPlayer ? -10 : 5;
    });
    s.projectiles = s.projectiles.filter(p => p.y > 0 && p.y < canvasHeight);

    // Move Particles
    s.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.04; // Lässt sie langsam verblassen
    });
    s.particles = s.particles.filter(p => p.life > 0);

    // Move / Spawn UFO
    if (s.ufo.active) {
      s.ufo.x += s.ufo.dir * 3;
      if (s.ufo.x > canvasWidth + s.ufo.width || s.ufo.x < -s.ufo.width * 2) {
        s.ufo.active = false;
      }
    } else if (Math.random() < 0.0015) { // Ca. alle 10-15 Sekunden bei 60fps
      s.ufo.active = true;
      s.ufo.dir = Math.random() < 0.5 ? 1 : -1;
      s.ufo.x = s.ufo.dir === 1 ? -s.ufo.width : canvasWidth;
    }

    // Move Enemies
    if (time - s.lastEnemyMove > 20) { 
      s.lastEnemyMove = time;
      let hitEdge = false;
      const activeEnemies = s.enemies.filter(e => e.alive);
      
      activeEnemies.forEach(e => {
        if (e.x <= 10 && s.enemyDir === -1) hitEdge = true;
        if (e.x >= canvasWidth - enemyWidth - 10 && s.enemyDir === 1) hitEdge = true;
      });

      if (hitEdge) {
        s.enemyDir *= -1;
        s.enemySpeed += 0.2; 
        activeEnemies.forEach(e => {
          e.y += 20;
          if (e.y >= canvasHeight - 80) {
            setGameOver(true);
            audioService.playFX('crash');
            audioService.stopMusic();
          }
        });
      } else {
        activeEnemies.forEach(e => {
          e.x += s.enemyDir * s.enemySpeed;
        });
      }

      // Enemy Shoot: Schusswahrscheinlichkeit steigt mit der Geschwindigkeit der Aliens
      // Startet bei ca. 1.75% und wird mit jedem Level/Randkontakt höher
      const shootProbability = 0.01 + (s.enemySpeed * 0.005);
      if (Math.random() < shootProbability && activeEnemies.length > 0) {
        const shooter = activeEnemies[Math.floor(Math.random() * activeEnemies.length)];
        s.projectiles.push({
          id: s.projIdCounter++,
          x: shooter.x + enemyWidth / 2 - projWidth / 2,
          y: shooter.y + enemyHeight,
          isPlayer: false
        });
      }
      
      if (activeEnemies.length === 0) {
          spawnEnemies();
      }
    }

    // Check Collisions
    let scoreAdded = 0;
    let hitPlayer = false;

    s.projectiles.forEach(p => {
      if (p.isPlayer) {
        // UFO Collision
        if (s.ufo.active && p.x < s.ufo.x + s.ufo.width && p.x + projWidth > s.ufo.x && p.y < s.ufo.y + s.ufo.height && p.y + projHeight > s.ufo.y) {
          s.ufo.active = false;
          p.y = -100; 
          scoreAdded += 50; // UFOs bringen fett Punkte
          audioService.playFX('score');
          
          // Explosion Partikel (Gold/Gelb für UFO)
          for (let i = 0; i < 15; i++) {
            s.particles.push({
              id: s.particleIdCounter++,
              x: s.ufo.x + s.ufo.width / 2,
              y: s.ufo.y + s.ufo.height / 2,
              vx: (Math.random() - 0.5) * 12,
              vy: (Math.random() - 0.5) * 12,
              life: 1.0,
              color: '#ffee00'
            });
          }
        }

        s.enemies.filter(e => e.alive).forEach(e => {
          if (p.x < e.x + enemyWidth && p.x + projWidth > e.x && p.y < e.y + enemyHeight && p.y + projHeight > e.y) {
            e.alive = false;
            p.y = -100; 
            scoreAdded += 10;
            audioService.playFX('eat');
            
            // Explosion Partikel spawnen
            for (let i = 0; i < 8; i++) {
              s.particles.push({
                id: s.particleIdCounter++,
                x: e.x + enemyWidth / 2,
                y: e.y + enemyHeight / 2,
                vx: (Math.random() - 0.5) * 8, // Zufällige Streuung X
                vy: (Math.random() - 0.5) * 8, // Zufällige Streuung Y
                life: 1.0,
                color: '#ff00ff'
              });
            }
          }
        });
      } else {
        const px = s.playerX;
        const py = canvasHeight - 40;
        if (p.x < px + playerWidth && p.x + projWidth > px && p.y < py + playerHeight && p.y + projHeight > py) {
          hitPlayer = true;
        }
      }
    });

    if (scoreAdded > 0) {
      setScore(prev => prev + scoreAdded);
    }

    if (hitPlayer) {
      setGameOver(true);
      audioService.playFX('crash');
      audioService.stopMusic();
    }
  }, [gameOver, isPaused, canvasWidth, canvasHeight, spawnEnemies]);

  return { state, score, gameOver, isPaused, setIsPaused, resetGame, update, playerWidth, playerHeight, enemyWidth, enemyHeight, projWidth, projHeight };
}
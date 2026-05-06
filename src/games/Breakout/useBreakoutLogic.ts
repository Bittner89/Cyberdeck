import { useState, useEffect, useCallback, useRef } from 'react';
import { audioService } from '../../services/audioService';

export interface Block {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  status: number;
  color: string;
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

const LEVELS = [
  // Level 1: Basic Wall
  [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],
  // Level 2: Gaps
  [
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
  ],
  // Level 3: Fortress
  [
    [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 0, 0, 0, 0, 1, 1, 0],
    [1, 1, 0, 1, 1, 1, 1, 0, 1, 1],
    [1, 1, 0, 1, 1, 1, 1, 0, 1, 1],
    [0, 1, 1, 0, 0, 0, 0, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
  ],
  // Level 4: Arrow
  [
    [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
    [0, 1, 1, 0, 0, 0, 0, 1, 1, 0],
    [1, 1, 0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
  ]
];

export interface PowerUp {
  id: number;
  x: number;
  y: number;
  type: 'expand' | 'laser';
  width: number;
  height: number;
}

export interface Projectile {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function useBreakoutLogic(canvasWidth: number, canvasHeight: number) {
  const [score, setScore] = useState(0);
  const [levelUI, setLevelUI] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);

  const paddleHeight = 15;
  const ballRadius = 8;
  const paddleY = canvasHeight - 60;

  const state = useRef({
    level: 1,
    paddleX: canvasWidth / 2 - 60,
    paddleWidth: 120,
    ball: { x: canvasWidth / 2, y: paddleY - ballRadius - 5, dx: 6, dy: -6, attached: true },
    blocks: [] as Block[],
    particles: [] as Particle[],
    powerUps: [] as PowerUp[],
    projectiles: [] as Projectile[],
    keys: { ArrowLeft: false, ArrowRight: false, " ": false },
    particleIdCounter: 0,
    powerUpIdCounter: 0,
    projIdCounter: 0,
    blockCount: 0,
    laserEndTime: 0,
    expandEndTime: 0,
    lastShotTime: 0
  });

  const generateBlocks = useCallback((levelIndex: number) => {
    const layout = LEVELS[levelIndex % LEVELS.length];
    const rows = layout.length;
    const cols = layout[0].length;
    const padding = 15;
    const offsetTop = 80;
    const offsetLeft = 35;
    const w = (canvasWidth - offsetLeft * 2 - padding * (cols - 1)) / cols;
    const h = 25;
    const colors = ['#ff0055', '#ff00ff', '#00ffff', '#00ff41', '#ffee00', '#ffffff'];

    const newBlocks: Block[] = [];
    let id = 0;
    let count = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (layout[r][c] === 1) {
          newBlocks.push({
            id: id++,
            x: offsetLeft + c * (w + padding),
            y: offsetTop + r * (h + padding),
            w,
            h,
            status: 1,
            color: colors[r % colors.length]
          });
          count++;
        }
      }
    }
    state.current.blocks = newBlocks;
    state.current.blockCount = count;
  }, [canvasWidth]);

  const resetGame = useCallback(() => {
    setScore(0);
    setGameOver(false);
    setIsPaused(true);
    setLevelUI(1);
    state.current.level = 1;
    state.current.keys = { ArrowLeft: false, ArrowRight: false, " ": false }; // Verhindert Sofortstart durch Leertaste
    state.current.paddleWidth = 120;
    state.current.paddleX = canvasWidth / 2 - state.current.paddleWidth / 2;
    state.current.ball = { x: canvasWidth / 2, y: paddleY - ballRadius - 5, dx: 6 * (Math.random() > 0.5 ? 1 : -1), dy: -6, attached: true };
    state.current.particles = [];
    state.current.powerUps = [];
    state.current.projectiles = [];
    state.current.laserEndTime = 0;
    state.current.expandEndTime = 0;
    generateBlocks(0);
  }, [canvasWidth, generateBlocks, paddleY]);

  const update = useCallback(() => {
    if (gameOver || isPaused) return;
    const s = state.current;
    const now = Date.now();

    // Move Paddle
    if (s.keys.ArrowLeft) s.paddleX -= 9;
    if (s.keys.ArrowRight) s.paddleX += 9;
    s.paddleX = Math.max(0, Math.min(canvasWidth - s.paddleWidth, s.paddleX));

    // Check PowerUps expiration
    if (s.expandEndTime > 0 && now > s.expandEndTime) {
      s.paddleWidth = 120;
      s.expandEndTime = 0;
      s.paddleX = Math.max(0, Math.min(canvasWidth - s.paddleWidth, s.paddleX));
    }
    if (s.laserEndTime > 0 && now > s.laserEndTime) {
      s.laserEndTime = 0;
    }

    // Laser shooting
    if (s.laserEndTime > 0 && s.keys[" "] && now - s.lastShotTime > 300 && !s.ball.attached) {
      s.projectiles.push({ id: s.projIdCounter++, x: s.paddleX + 10, y: paddleY, width: 4, height: 15 });
      s.projectiles.push({ id: s.projIdCounter++, x: s.paddleX + s.paddleWidth - 14, y: paddleY, width: 4, height: 15 });
      s.lastShotTime = now;
      audioService.playFX('select');
    }

    // Move Projectiles
    s.projectiles.forEach(p => { p.y -= 10; });
    s.projectiles = s.projectiles.filter(p => p.y > 0);

    let scoreAdded = 0;

    // Move PowerUps
    s.powerUps.forEach(p => { p.y += 3; });
    s.powerUps = s.powerUps.filter(p => {
      if (p.y + p.height >= paddleY && p.y <= paddleY + paddleHeight && p.x + p.width >= s.paddleX && p.x <= s.paddleX + s.paddleWidth) {
        audioService.playFX('eat');
        scoreAdded += 50;
        if (p.type === 'expand') {
          s.paddleWidth = 200;
          s.expandEndTime = now + 15000; // 15 seconds
        } else if (p.type === 'laser') {
          s.laserEndTime = now + 15000; // 15 seconds
        }
        return false;
      }
      return p.y < canvasHeight;
    });

    if (s.ball.attached) {
      s.ball.x = s.paddleX + s.paddleWidth / 2;
      s.ball.y = paddleY - ballRadius - 1;
      if (s.keys[" "]) {
        s.ball.attached = false;
        s.ball.dy = -6;
        s.ball.dx = 6 * (Math.random() > 0.5 ? 1 : -1);
        audioService.playFX('select');
      }
    } else {
      // Move Ball
      s.ball.x += s.ball.dx;
      s.ball.y += s.ball.dy;

      // Wall collisions
      if (s.ball.x + s.ball.dx > canvasWidth - ballRadius || s.ball.x + s.ball.dx < ballRadius) {
        s.ball.dx = -s.ball.dx;
      }
      if (s.ball.y + s.ball.dy < ballRadius) {
        s.ball.dy = -s.ball.dy;
      } else if (s.ball.y + s.ball.dy > canvasHeight - ballRadius) {
        setGameOver(true);
        audioService.playFX('crash');
        audioService.stopMusic();
        return;
      }

      // Paddle collision
      if (s.ball.y + ballRadius >= paddleY && s.ball.y - ballRadius <= paddleY + paddleHeight) {
        if (s.ball.x >= s.paddleX && s.ball.x <= s.paddleX + s.paddleWidth) {
          s.ball.dy = -Math.abs(s.ball.dy); // Zwingt den Ball nach oben (gegen Hängenbleiben)
          const hitPoint = s.ball.x - (s.paddleX + s.paddleWidth / 2);
          s.ball.dx = hitPoint * 0.15; // Schusswinkel durch Position auf dem Schläger anpassen
          audioService.playFX('select');
        }
      }
    }

    // Block collision
    for (let i = 0; i < s.blocks.length; i++) {
      const b = s.blocks[i];
      if (b.status === 1) {
        let blockHit = false;

        // Projectile hit
        for (let j = 0; j < s.projectiles.length; j++) {
          const p = s.projectiles[j];
          if (p.x < b.x + b.w && p.x + p.width > b.x && p.y < b.y + b.h && p.y + p.height > b.y) {
            blockHit = true;
            p.y = -100; // mark for deletion
            break;
          }
        }

        // Ball hit
        let testX = s.ball.x; let testY = s.ball.y;
        if (s.ball.x < b.x) testX = b.x; else if (s.ball.x > b.x + b.w) testX = b.x + b.w;
        if (s.ball.y < b.y) testY = b.y; else if (s.ball.y > b.y + b.h) testY = b.y + b.h;

        const distX = s.ball.x - testX; const distY = s.ball.y - testY;
        const distance = Math.sqrt((distX * distX) + (distY * distY));

        let hitByBall = false;
        if (distance <= ballRadius) {
          blockHit = true;
          hitByBall = true;
          if (Math.abs(distX) < Math.abs(distY)) s.ball.dy = -s.ball.dy; else s.ball.dx = -s.ball.dx;
        }

        if (blockHit) {
          b.status = 0; scoreAdded += 10; s.blockCount--;
          audioService.playFX('score');
          
          for (let p = 0; p < 8; p++) {
            s.particles.push({ id: s.particleIdCounter++, x: b.x + b.w / 2, y: b.y + b.h / 2, vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10, life: 1.0, color: b.color });
          }
          
          if (Math.random() < 0.1) { // 10% Chance für Power-Up Drop
             const type = Math.random() < 0.5 ? 'expand' : 'laser';
             s.powerUps.push({ id: s.powerUpIdCounter++, x: b.x + b.w / 2 - 10, y: b.y + b.h / 2, width: 20, height: 20, type });
          }
          
          if (hitByBall) break; // Max 1 Block pro Frame für den Ball berechnen
        }
      }
    }

    if (scoreAdded > 0) setScore(prev => prev + scoreAdded);
    if (s.blockCount <= 0) { 
      s.level++;
      setLevelUI(s.level);
      generateBlocks(s.level - 1); 
      s.ball = { x: canvasWidth / 2, y: paddleY - ballRadius - 5, dx: 6 * (Math.random() > 0.5 ? 1 : -1), dy: -6, attached: true }; 
      s.paddleWidth = 120; 
      s.paddleX = canvasWidth / 2 - s.paddleWidth / 2; 
      s.powerUps = [];
      s.projectiles = [];
      s.laserEndTime = 0;
      s.expandEndTime = 0;
      audioService.playFX('confirm'); 
    }

    // Move Particles
    s.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life -= 0.05; });
    s.particles = s.particles.filter(p => p.life > 0);

  }, [gameOver, isPaused, canvasWidth, canvasHeight, paddleY, generateBlocks]);

  return { state, score, levelUI, gameOver, isPaused, setIsPaused, resetGame, update, paddleHeight, ballRadius, paddleY };
}
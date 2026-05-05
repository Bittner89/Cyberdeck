import React, { useRef, useEffect, useState } from 'react';
import { useSpaceInvadersLogic } from './useSpaceInvadersLogic';
import { audioService } from '../../services/audioService';
import { scoreService, ScoreEntry } from '../../services/scoreService';
import { useAppContext } from '../../context/AppContext';

interface SpaceInvadersProps {
  onGameOver: (score: number) => void;
}

export default function SpaceInvadersGame({ onGameOver }: SpaceInvadersProps) {
  const { navigate } = useAppContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasBooted, setHasBooted] = useState(false);
  const [realHighscores, setRealHighscores] = useState<ScoreEntry[]>([]);
  const width = 800;
  const height = 800;

  const { 
    state, score, gameOver, isPaused, setIsPaused, resetGame, update,
    playerWidth, playerHeight, enemyWidth, enemyHeight, projWidth, projHeight
  } = useSpaceInvadersLogic(width, height);

  // Highscores laden
  useEffect(() => {
    scoreService.getHighscores('spaceinvaders').then(setRealHighscores);
  }, [gameOver]);

  // Musik stoppen, wenn das Spiel manuell verlassen wird
  const handleAbort = () => {
    audioService.stopMusic();
    navigate('menu');
  };

  // Canvas Drawing und Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let requestRef: number;
    const render = (time: number) => {
      if (!isPaused && !gameOver && hasBooted) {
        update(time);
      }

      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      // Gitter
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
      ctx.lineWidth = 0.5;
      for(let x = 0; x <= width; x += 50) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for(let y = 0; y <= height; y += 50) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }

      const s = state.current;

      // Player Ship (Sleek Fighter)
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00ffff';
      ctx.fillStyle = '#00ffff';
      ctx.beginPath();
      ctx.moveTo(s.playerX + playerWidth / 2, height - 50); // Nase
      ctx.lineTo(s.playerX + playerWidth, height - 20);     // Rechte Flügelspitze
      ctx.lineTo(s.playerX + playerWidth / 2 + 10, height - 25); // Rechte Triebwerks-Einkerbung
      ctx.lineTo(s.playerX + playerWidth / 2, height - 20); // Mitte Triebwerk
      ctx.lineTo(s.playerX + playerWidth / 2 - 10, height - 25); // Linke Triebwerks-Einkerbung
      ctx.lineTo(s.playerX, height - 20);                   // Linke Flügelspitze
      ctx.closePath();
      ctx.fill();

      // Enemy Ships (Alien Invader)
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ff00ff';
      s.enemies.forEach(e => {
        if (e.alive) {
          ctx.fillStyle = '#ff00ff';
          ctx.beginPath();
          ctx.moveTo(e.x + enemyWidth * 0.2, e.y);
          ctx.lineTo(e.x + enemyWidth * 0.8, e.y);
          ctx.lineTo(e.x + enemyWidth, e.y + enemyHeight * 0.4);
          ctx.lineTo(e.x + enemyWidth, e.y + enemyHeight * 0.8);
          ctx.lineTo(e.x + enemyWidth * 0.8, e.y + enemyHeight);
          ctx.lineTo(e.x + enemyWidth * 0.6, e.y + enemyHeight * 0.6);
          ctx.lineTo(e.x + enemyWidth * 0.4, e.y + enemyHeight * 0.6);
          ctx.lineTo(e.x + enemyWidth * 0.2, e.y + enemyHeight);
          ctx.lineTo(e.x, e.y + enemyHeight * 0.8);
          ctx.lineTo(e.x, e.y + enemyHeight * 0.4);
          ctx.closePath();
          ctx.fill();
          
          // Alien Augen / Leuchtender Kern
          ctx.fillStyle = '#000';
          ctx.shadowBlur = 0;
          ctx.fillRect(e.x + enemyWidth * 0.25, e.y + enemyHeight * 0.3, enemyWidth * 0.15, enemyHeight * 0.2);
          ctx.fillRect(e.x + enemyWidth * 0.6, e.y + enemyHeight * 0.3, enemyWidth * 0.15, enemyHeight * 0.2);
          ctx.shadowBlur = 15; // Glow für das nächste Alien wiederherstellen
        }
      });

      // UFO Ship
      if (s.ufo.active) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ffee00';
        ctx.fillStyle = '#ffee00';
        ctx.beginPath();
        ctx.moveTo(s.ufo.x + s.ufo.width * 0.3, s.ufo.y);
        ctx.lineTo(s.ufo.x + s.ufo.width * 0.7, s.ufo.y);
        ctx.lineTo(s.ufo.x + s.ufo.width * 0.9, s.ufo.y + s.ufo.height * 0.4);
        ctx.lineTo(s.ufo.x + s.ufo.width, s.ufo.y + s.ufo.height * 0.6);
        ctx.lineTo(s.ufo.x + s.ufo.width * 0.8, s.ufo.y + s.ufo.height);
        ctx.lineTo(s.ufo.x + s.ufo.width * 0.2, s.ufo.y + s.ufo.height);
        ctx.lineTo(s.ufo.x, s.ufo.y + s.ufo.height * 0.6);
        ctx.lineTo(s.ufo.x + s.ufo.width * 0.1, s.ufo.y + s.ufo.height * 0.4);
        ctx.closePath();
        ctx.fill();
        
        // UFO lights
        ctx.fillStyle = '#ff0055';
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#ff0055';
        ctx.fillRect(s.ufo.x + s.ufo.width * 0.3, s.ufo.y + s.ufo.height * 0.6, 4, 4);
        ctx.fillRect(s.ufo.x + s.ufo.width * 0.5 - 2, s.ufo.y + s.ufo.height * 0.6, 4, 4);
        ctx.fillRect(s.ufo.x + s.ufo.width * 0.7 - 4, s.ufo.y + s.ufo.height * 0.6, 4, 4);
      }

      // Projectiles
      s.projectiles.forEach(p => {
        ctx.shadowBlur = 5;
        ctx.shadowColor = p.isPlayer ? '#00ffff' : '#ff00ff';
        ctx.fillStyle = p.isPlayer ? '#fff' : '#ff0055';
        ctx.fillRect(p.x, p.y, projWidth, projHeight);
      });

      // Particles (Explosionen)
      s.particles.forEach(p => {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 4, 4);
      });
      ctx.globalAlpha = 1.0; // Wichtig: Alpha für den nächsten Frame zurücksetzen

      ctx.shadowBlur = 0;

      requestRef = requestAnimationFrame(render);
    };

    requestRef = requestAnimationFrame(render);
    return () => cancelAnimationFrame(requestRef);
  }, [hasBooted, isPaused, gameOver, state, update, playerWidth, playerHeight, enemyWidth, enemyHeight, projWidth, projHeight]);

  // Steuerung
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "Escape", "Enter"].includes(e.key)) {
        e.preventDefault();
      }

      if (!hasBooted && (e.key === 'Enter' || e.key === ' ')) {
        audioService.init(); 
        setHasBooted(true);
        resetGame();
        return;
      }

      if (!hasBooted || gameOver) return;

      if (e.key === 'Escape') {
        setIsPaused(prev => !prev);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasBooted, isPaused, gameOver, setIsPaused, resetGame]);

  return (
    <div className="flex flex-row gap-6 p-4 bg-black/60 border-2 border-neon-cyan shadow-neon-big animate-glitch-entry h-212.5">
      <div className="relative border-4 border-neon-cyan/50 shadow-neon">
        <canvas ref={canvasRef} width={width} height={height} className="bg-black" />
        
        {/* START SCREEN */}
        {!hasBooted && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20">
            <div className="text-center p-8 border-2 border-neon-cyan animate-pulse">
              <h2 className="text-6xl text-neon-cyan mb-8 tracking-tighter uppercase italic">ALIEN_THREAT</h2>
              <p className="text-2xl text-neon-pink animate-bounce mb-4">PRESS [ENTER] TO INITIALIZE</p>
            </div>
          </div>
        )}

        {/* PAUSE MENU */}
        {hasBooted && isPaused && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-25 backdrop-blur-sm">
            <div className="text-center p-10 border-4 border-neon-cyan bg-black shadow-neon">
              <h2 className="text-6xl text-neon-cyan mb-8 italic uppercase font-black">System_Paused</h2>
              <div className="flex flex-col gap-4">
                <button onClick={() => setIsPaused(false)} className="border-2 border-neon-cyan p-4 text-neon-cyan hover:bg-neon-cyan hover:text-black text-2xl transition-all uppercase">Continue_Mission [ESC]</button>
                <button onClick={handleAbort} className="border-2 border-neon-pink p-4 text-neon-pink hover:bg-neon-pink hover:text-black text-2xl transition-all uppercase">Abort_Mission [Exit]</button>
              </div>
            </div>
          </div>
        )}

        {/* GAME OVER SCREEN */}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-30">
            <div className="text-center p-10 border-4 border-neon-pink bg-black shadow-neon-pink">
              <h2 className="text-7xl text-neon-pink mb-4 italic uppercase font-black">Ship_Destroyed</h2>
              <p className="text-3xl text-white mb-8 uppercase tracking-widest">Final_Score: {score}</p>
              <div className="flex gap-4 justify-center">
                <button onClick={resetGame} className="border-2 border-neon-cyan p-3 text-neon-cyan hover:bg-neon-cyan hover:text-black text-xl transition-all uppercase">REBOOT</button>
                <button onClick={() => onGameOver(score)} className="border-2 border-neon-pink p-3 text-neon-pink hover:bg-neon-pink hover:text-black text-xl transition-all uppercase">UPLOAD_SCORE</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* HIGHSCORES */}
      <div className="w-75 font-vt323 text-neon-cyan border border-neon-cyan/20 bg-neon-cyan/5 p-4 flex flex-col overflow-hidden">
        <h3 className="text-2xl border-b border-neon-cyan/30 pb-2 mb-4 italic uppercase tracking-tighter shadow-neon">Top_10_Agents</h3>
        <div className="flex-1 space-y-2">
          {realHighscores.map((entry, i) => (
            <div key={entry.id} className="flex items-center text-lg border-b border-neon-cyan/5 pb-1 group hover:bg-neon-cyan/10 px-1">
              <span className="opacity-40 inline-block w-10 shrink-0">#{String(i + 1).padStart(2, '0')}</span>
              <span className="flex-1 tracking-widest truncate mr-2 group-hover:text-white transition-colors">{entry.username?.toUpperCase() || 'ANONYMOUS'}</span>
              <span className="text-white shrink-0 tabular-nums">{entry.score}</span>
            </div>
          ))}
        </div>

        {/* CURRENT SCORE DISPLAY */}
        <div className="mt-4 pt-4 border-t border-neon-cyan/30 text-right">
          <p className="text-sm opacity-50 uppercase tracking-widest mb-1">Current_Score</p>
          <p className="text-6xl text-neon-pink [text-shadow:0_0_15px_rgba(255,0,255,0.8)] tabular-nums leading-none">{score}</p>
        </div>
      </div>
    </div>
  );
}
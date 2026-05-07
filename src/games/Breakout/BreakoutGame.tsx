import React, { useRef, useEffect, useState } from 'react';
import { useBreakoutLogic } from './useBreakoutLogic';
import { audioService } from '../../services/audioService';
import { scoreService, ScoreEntry } from '../../services/scoreService';
import { useAppContext } from '../../context/AppContext';
import { useIsMobile } from '../../hooks/useIsMobile';

interface BreakoutProps {
  onGameOver: (score: number) => void;
}

function BreakoutGame({ onGameOver }: BreakoutProps) {
  const { navigate } = useAppContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasBooted, setHasBooted] = useState(false);
  const [realHighscores, setRealHighscores] = useState<ScoreEntry[]>([]);
  const width = 800;
  const height = 800;

  const isMobile = useIsMobile();

  const {
    state, score, levelUI, gameOver, isPaused, setIsPaused, resetGame, update,
    paddleHeight, ballRadius, paddleY
  } = useBreakoutLogic(width, height);

  useEffect(() => {
    scoreService.getHighscores('breakout').then(setRealHighscores);
  }, [gameOver]);

  // Automatischer Score-Upload bei Game Over
  const scoreUploadedRef = useRef(false);
  useEffect(() => {
    if (!gameOver) scoreUploadedRef.current = false;
    if (gameOver && score > 0 && !scoreUploadedRef.current) {
      onGameOver(score);
      scoreUploadedRef.current = true;
    }
  }, [gameOver, score, onGameOver]);

  const handleAbort = () => {
    audioService.stopMusic();
    navigate('menu');
  };

  const handleRestart = () => {
    resetGame();
    setHasBooted(false);
    audioService.stopMusic();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let requestRef: number;
    const render = () => {
      if (!isPaused && !gameOver && hasBooted) {
        update();
      }

      ctx.fillStyle = '#010808';
      ctx.fillRect(0, 0, width, height);

      // Grid (Matrix Vibe)
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.05)';
      ctx.lineWidth = 1;
      for(let x = 0; x <= width; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for(let y = 0; y <= height; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }

      const s = state.current;

      // Paddle (Deflector Shield)
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00ffff';
      ctx.fillStyle = '#00ffff';
      ctx.fillRect(s.paddleX, paddleY, s.paddleWidth, paddleHeight);

      // Laser Cannons on Paddle
      if (s.laserEndTime > 0) {
        ctx.fillStyle = '#ff0055';
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 10;
        ctx.fillRect(s.paddleX + 6, paddleY - 5, 8, 10);
        ctx.fillRect(s.paddleX + s.paddleWidth - 14, paddleY - 5, 8, 10);
        // Core lights
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(s.paddleX + 8, paddleY - 2, 4, 4);
        ctx.fillRect(s.paddleX + s.paddleWidth - 12, paddleY - 2, 4, 4);
      }

      // Ball (Data Payload)
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ffffff';
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.ball.x, s.ball.y, ballRadius, 0, Math.PI * 2);
      ctx.fill();

      // Blocks (ICE Nodes)
      s.blocks.forEach(b => {
        if (b.status === 1) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = b.color;
          ctx.fillStyle = b.color;
          ctx.globalAlpha = 0.8;
          ctx.fillRect(b.x, b.y, b.w, b.h);
          ctx.globalAlpha = 1.0;
          // Inner glowing core
          ctx.fillStyle = '#fff';
          ctx.shadowBlur = 0;
          ctx.fillRect(b.x + 5, b.y + 5, b.w - 10, b.h - 10);
        }
      });

      // PowerUps
      s.powerUps.forEach(p => {
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.type === 'expand' ? '#00ff41' : '#ff0055';
        ctx.fillStyle = p.type === 'expand' ? '#00ff41' : '#ff0055';
        // Draw as Diamond
        ctx.beginPath();
        ctx.moveTo(p.x + p.width / 2, p.y);
        ctx.lineTo(p.x + p.width, p.y + p.height / 2);
        ctx.lineTo(p.x + p.width / 2, p.y + p.height);
        ctx.lineTo(p.x, p.y + p.height / 2);
        ctx.closePath();
        ctx.fill();
        // Inner Letter
        ctx.fillStyle = '#000';
        ctx.shadowBlur = 0;
        ctx.font = '14px VT323';
        ctx.fillText(p.type === 'expand' ? 'W' : 'L', p.x + 6, p.y + 14);
      });

      // Projectiles
      s.projectiles.forEach(p => {
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff0055';
        ctx.fillStyle = '#ff0055';
        ctx.fillRect(p.x, p.y, p.width, p.height);
      });

      // Particles (Shattered ICE)
      s.particles.forEach(p => {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 6, 6);
      });
      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;

      // Level Start Message
      if (s.ball.attached && !gameOver && hasBooted) {
        ctx.fillStyle = '#00ffff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ffff';
        ctx.font = '24px VT323';
        ctx.textAlign = 'center';
        ctx.fillText(`LEVEL ${s.level} - PRESS [SPACE] TO LAUNCH`, width / 2, height / 2 + 50);
        ctx.textAlign = 'left';
        ctx.shadowBlur = 0;
      }

      requestRef = requestAnimationFrame(render);
    };

    requestRef = requestAnimationFrame(render);
    return () => cancelAnimationFrame(requestRef);
  }, [hasBooted, isPaused, gameOver, state, update, paddleHeight, ballRadius, paddleY]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state.current.keys.hasOwnProperty(e.key)) state.current.keys[e.key as keyof typeof state.current.keys] = true;
      if (["ArrowLeft", "ArrowRight", " ", "Escape", "Enter"].includes(e.key)) e.preventDefault();
      if (!hasBooted && (e.key === 'Enter' || e.key === ' ')) { 
        audioService.init(); 
        resetGame();
        setHasBooted(true); 
        setIsPaused(false);
        audioService.startMusic('breakout');
        return; 
      }
      if (!hasBooted) return;
      if (gameOver) {
        if (e.key.toLowerCase() === 'r') handleRestart();
        if (e.key.toLowerCase() === 'q') handleAbort();
        return;
      }
      if (e.key === 'Escape') {
        setIsPaused(prev => !prev);
        return;
      }
      if (isPaused) {
        if (e.key.toLowerCase() === 'r') handleRestart();
        if (e.key.toLowerCase() === 'q') { audioService.stopMusic(); navigate('menu'); }
        return;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (state.current.keys.hasOwnProperty(e.key)) state.current.keys[e.key as keyof typeof state.current.keys] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, [hasBooted, gameOver, isPaused, setIsPaused, resetGame, state, navigate]);

  // --- MOBILE VERSION ---
  if (isMobile) {
    return (
      <div className="flex flex-col w-full h-full max-h-full overflow-hidden relative bg-black z-20">
        <div className="relative w-full flex-1 min-h-0 flex items-center justify-center bg-black overflow-hidden">
          <canvas ref={canvasRef} width={width} height={height} className="w-full h-full object-contain" />

          {!hasBooted && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20">
              <div className="text-center p-4 border border-neon-cyan animate-pulse">
                <h2 className="text-3xl text-neon-cyan mb-4 italic">FIREWALL_BREACH</h2>
                <p className="text-sm text-neon-pink animate-bounce">PRESS [ENT] TO INIT</p>
              </div>
            </div>
          )}

          {hasBooted && isPaused && !gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-25 backdrop-blur-sm">
              <div className="text-center p-4 border-2 border-neon-cyan bg-black shadow-neon">
                <h2 className="text-3xl text-neon-cyan mb-4 italic">Paused</h2>
                <div className="flex flex-col gap-2">
                  <button onClick={() => setIsPaused(false)} className="border border-neon-cyan p-2 text-neon-cyan text-sm">Continue [ESC]</button>
                  <button onClick={handleRestart} className="border border-neon-cyan p-2 text-neon-cyan text-sm">Restart [R]</button>
                  <button onClick={handleAbort} className="border border-neon-pink p-2 text-neon-pink text-sm">Dashboard [Q]</button>
                </div>
              </div>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-30 font-vt323 p-4">
              <h2 className="text-neon-pink text-6xl mb-6 shadow-neon-pink uppercase">Link_Severed</h2>
              <div className="flex flex-col gap-3 w-full max-w-[250px]">
                <button onClick={handleRestart} className="border border-neon-cyan p-3 text-neon-cyan active:bg-neon-cyan active:text-black text-xl text-center transition-colors">REBOOT</button>
                <button onClick={handleAbort} className="border border-neon-pink p-3 text-neon-pink active:bg-neon-pink active:text-black text-xl text-center transition-colors">DASHBOARD</button>
              </div>
            </div>
          )}
        </div>

        {/* MOBILE SCORE DISPLAY */}
        <div className="w-full shrink-0 font-vt323 text-neon-cyan border-t border-neon-cyan/20 bg-neon-cyan/5 p-2 z-10 flex items-center justify-between">
          <button onClick={handleAbort} className="border border-neon-pink/50 text-neon-pink px-3 py-1 text-sm active:bg-neon-pink active:text-black transition-colors flex items-center gap-2">
            <span>[←]</span> ABORT
          </button>
          <div className="flex items-end gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] opacity-50 uppercase tracking-widest leading-none mb-1">Level</span>
              <span className="text-xl text-neon-cyan tabular-nums leading-none">{levelUI}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] opacity-50 uppercase tracking-widest leading-none mb-1">Score</span>
              <span className="text-3xl text-neon-pink [text-shadow:0_0_15px_rgba(255,0,255,0.8)] tabular-nums leading-none">{score}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- DESKTOP VERSION ---
  return (
    <div className="flex flex-row gap-6 p-4 bg-black/60 border-2 border-neon-cyan shadow-neon-big animate-glitch-entry w-full lg:w-[1164px] lg:h-[850px] max-h-full">
      <div className="relative border-4 border-neon-cyan/50 shadow-neon flex-1 flex items-center justify-center bg-black overflow-hidden">
        <canvas ref={canvasRef} width={width} height={height} className="w-full h-full object-contain" />
        {!hasBooted && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20">
            <div className="text-center p-8 border-2 border-neon-cyan animate-pulse">
              <h2 className="text-6xl text-neon-cyan mb-8 tracking-tighter uppercase italic">FIREWALL_BREACH</h2>
              <p className="text-2xl text-neon-pink animate-bounce mb-4">PRESS [ENTER] TO INITIALIZE</p>
            </div>
          </div>
        )}
        {hasBooted && isPaused && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-25 backdrop-blur-sm">
            <div className="text-center p-10 border-4 border-neon-cyan bg-black shadow-neon">
              <h2 className="text-6xl text-neon-cyan mb-8 italic uppercase font-black">System_Paused</h2>
              <div className="flex flex-col gap-4">
                <button onClick={() => setIsPaused(false)} className="border-2 border-neon-cyan p-4 text-neon-cyan hover:bg-neon-cyan hover:text-black text-2xl transition-all uppercase">Continue_Mission [ESC]</button>
                <button onClick={handleRestart} className="border-2 border-neon-cyan p-4 text-neon-cyan hover:bg-neon-cyan hover:text-black text-2xl transition-all uppercase">Restart_Mission [R]</button>
                <button onClick={handleAbort} className="border-2 border-neon-pink p-4 text-neon-pink hover:bg-neon-pink hover:text-black text-2xl transition-all uppercase">Return_to_Dashboard [Q]</button>
              </div>
            </div>
          </div>
        )}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-30">
            <div className="text-center p-10 border-4 border-neon-pink bg-black shadow-neon-pink">
              <h2 className="text-7xl text-neon-pink mb-4 italic uppercase font-black">Link_Severed</h2>
              <p className="text-3xl text-white mb-8 uppercase tracking-widest">Final_Score: {score}</p>
              <div className="flex gap-4 justify-center">
                <button onClick={handleRestart} className="border-2 border-neon-cyan p-3 text-neon-cyan hover:bg-neon-cyan hover:text-black text-xl transition-all uppercase">REBOOT [R]</button>
                <button onClick={handleAbort} className="border-2 border-neon-pink p-3 text-neon-pink hover:bg-neon-pink hover:text-black text-xl transition-all uppercase">DASHBOARD [Q]</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="w-72 shrink-0 font-vt323 text-neon-cyan border border-neon-cyan/20 bg-neon-cyan/5 p-4 flex flex-col overflow-hidden">
        <h3 className="shrink-0 text-2xl border-b border-neon-cyan/30 pb-2 mb-4 italic uppercase tracking-tighter shadow-neon">Top_10_Agents</h3>
        <div className="flex-1 space-y-2 overflow-y-auto min-h-0 custom-scrollbar pr-2">
          {realHighscores.map((entry, i) => (
            <div key={entry.id} className="flex items-center text-lg border-b border-neon-cyan/5 pb-1 group hover:bg-neon-cyan/10 px-1">
              <span className="opacity-40 inline-block w-10 shrink-0">#{String(i + 1).padStart(2, '0')}</span>
              <span className="flex-1 tracking-widest truncate mr-2 group-hover:text-white transition-colors">{entry.username?.toUpperCase() || 'ANONYMOUS'}</span>
              <span className="text-white shrink-0 tabular-nums">{entry.score}</span>
            </div>
          ))}
        </div>
        <div className="shrink-0 mt-4 pt-4 border-t border-neon-cyan/30 text-right">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm opacity-50 uppercase tracking-widest">Level_{levelUI}</span>
            <span className="text-sm opacity-50 uppercase tracking-widest">Current_Score</span>
          </div>
          <p className="text-6xl text-neon-pink [text-shadow:0_0_15px_rgba(255,0,255,0.8)] tabular-nums leading-none">{score}</p>
        </div>
      </div>
    </div>
  );
}

export default BreakoutGame;
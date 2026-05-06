import React, { useRef, useEffect, useState } from 'react';
import { useSnakeLogic } from './useSnakeLogic';
import { audioService } from '../../services/audioService';
import { scoreService, ScoreEntry } from '../../services/scoreService';
import { useAppContext } from '../../context/AppContext';
import { useIsMobile } from '../../hooks/useIsMobile';

interface SnakeGameProps {
  onGameOver: (score: number) => void;
}

export default function SnakeGame({ onGameOver }: SnakeGameProps) {
  const { navigate } = useAppContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasBooted, setHasBooted] = useState(false);
  const [realHighscores, setRealHighscores] = useState<ScoreEntry[]>([]);
  const width = 800;
  const height = 800;
  const grid = 25;
  
  const isMobile = useIsMobile();

  const { 
    snake, food, score, highscore, gameOver, 
    setDirection, gridSize, isPaused, setIsPaused, resetGame 
  } = useSnakeLogic(width, height, grid);

  // Highscores laden
  useEffect(() => {
    scoreService.getHighscores().then(setRealHighscores);
  }, [gameOver]);

  // Musik pausieren und fortsetzen
  useEffect(() => {
    if (!hasBooted || gameOver) return;
    if (isPaused) {
      audioService.pauseMusic();
    } else {
      audioService.resumeMusic();
    }
  }, [isPaused, hasBooted, gameOver]);

  // Musik stoppen, wenn das Spiel manuell verlassen wird
  const handleAbort = () => {
    audioService.stopMusic();
    navigate('menu');
  };

  // Canvas Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    // Gitter
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
    ctx.lineWidth = 0.5;
    for(let x = 0; x <= width; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for(let y = 0; y <= height; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    // Essen (Data Fragment - Diamond)
    const cx = food.x + gridSize / 2;
    const cy = food.y + gridSize / 2;
    const r = gridSize / 2 - 2;
    
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ff00ff';
    ctx.fillStyle = '#ff00ff';
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r, cy);
    ctx.lineTo(cx, cy + r);
    ctx.lineTo(cx - r, cy);
    ctx.closePath();
    ctx.fill();

    // Essen Kern
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx, cy, r / 3, 0, Math.PI * 2);
    ctx.fill();

    // Schlange (Data Stream)
    snake.forEach((part, i) => {
      ctx.shadowBlur = i === 0 ? 15 : 10;
      ctx.shadowColor = '#00ffff';
      
      if (i === 0) {
        // Kopf: Leuchtender Block mit Kontrast-Kern
        ctx.fillStyle = '#fff';
        ctx.fillRect(part.x + 1, part.y + 1, gridSize - 2, gridSize - 2);
        
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#000';
        ctx.fillRect(part.x + 6, part.y + 6, gridSize - 12, gridSize - 12);
        
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(part.x + 8, part.y + 8, gridSize - 16, gridSize - 16);
      } else {
        // Körper: Wird zum Ende hin kleiner und transparenter
        const scale = 1 - (i / snake.length) * 0.4; 
        const size = gridSize * scale;
        const offset = (gridSize - size) / 2;
        
        ctx.globalAlpha = Math.max(0.2, 1 - (i / snake.length));
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(part.x + offset, part.y + offset, size, size);
        
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(part.x + offset + 2, part.y + offset + 2, size - 4, size - 4);
        
        ctx.globalAlpha = 1.0;
      }
    });

    ctx.shadowBlur = 0;
  }, [snake, food, gridSize]);

  // Steuerung
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "Escape", "Enter"].includes(e.key)) {
        e.preventDefault();
      }

      if (!hasBooted && (e.key === 'Enter' || e.key === ' ')) {
        audioService.init(); 
        audioService.startMusic('snake'); 
        setHasBooted(true);
        setIsPaused(false);
        return;
      }

      if (!hasBooted || gameOver) return;

      if (e.key === 'Escape') {
        setIsPaused(prev => !prev);
        return;
      }

      if (!isPaused) {
        switch (e.key) {
          case 'ArrowUp': setDirection({ x: 0, y: -gridSize }); break;
          case 'ArrowDown': setDirection({ x: 0, y: gridSize }); break;
          case 'ArrowLeft': setDirection({ x: -gridSize, y: 0 }); break;
          case 'ArrowRight': setDirection({ x: gridSize, y: 0 }); break;
          case ' ': setIsPaused(prev => !prev); break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setDirection, gridSize, setIsPaused, hasBooted, isPaused, gameOver]);

  // --- MOBILE VERSION ---
  if (isMobile) {
    return (
      <div className="flex flex-col w-full h-full max-h-full overflow-hidden relative bg-black z-20">
        <div className="relative w-full flex-1 min-h-0 flex items-center justify-center bg-black overflow-hidden">
          <canvas ref={canvasRef} width={width} height={height} className="w-full h-full object-contain" />
          
          {!hasBooted && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20">
              <div className="text-center p-4 border border-neon-cyan animate-pulse">
                <h2 className="text-3xl text-neon-cyan mb-4 italic">SNAKE_PROTOCOL</h2>
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
                  <button onClick={handleAbort} className="border border-neon-pink p-2 text-neon-pink text-sm">Abort [Exit]</button>
                </div>
              </div>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-30 font-vt323 p-4">
              <h2 className="text-neon-pink text-6xl mb-6 shadow-neon-pink uppercase">CRASH</h2>
              <div className="flex flex-col gap-3 w-full max-w-[250px]">
                <button onClick={resetGame} className="border border-neon-cyan p-3 text-neon-cyan active:bg-neon-cyan active:text-black text-xl text-center transition-colors">REBOOT</button>
                <button onClick={() => onGameOver(score)} className="border border-neon-cyan p-3 text-neon-cyan active:bg-neon-cyan active:text-black text-xl text-center transition-colors">UPLOAD_SCORE</button>
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
          <div className="flex flex-col items-end">
            <span className="text-[10px] opacity-50 uppercase tracking-widest leading-none mb-1">Current_Score</span>
            <span className="text-3xl text-neon-pink [text-shadow:0_0_15px_rgba(255,0,255,0.8)] tabular-nums leading-none">{score}</span>
          </div>
        </div>
      </div>
    );
  }

  // --- DESKTOP VERSION (Bleibt komplett unangetastet!) ---
  return (
    <div className="flex flex-row gap-6 p-4 bg-black/60 border-2 border-neon-cyan shadow-neon-big animate-glitch-entry h-212.5">
      <div className="relative border-4 border-neon-cyan/50 shadow-neon">
        <canvas ref={canvasRef} width={width} height={height} className="bg-black" />
        
        {/* START SCREEN */}
        {!hasBooted && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20">
            <div className="text-center p-8 border-2 border-neon-cyan animate-pulse">
              <h2 className="text-6xl text-neon-cyan mb-8 tracking-tighter uppercase italic">SNAKE_PROTOCOL</h2>
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
                <button 
                  onClick={() => setIsPaused(false)} 
                  className="border-2 border-neon-cyan p-4 text-neon-cyan hover:bg-neon-cyan hover:text-black text-2xl transition-all uppercase"
                >
                  Continue_Mission [ESC]
                </button>
                <button 
                  onClick={handleAbort} // Ruft jetzt die Stopp-Funktion auf
                  className="border-2 border-neon-pink p-4 text-neon-pink hover:bg-neon-pink hover:text-black text-2xl transition-all uppercase"
                >
                  Abort_Mission [Exit]
                </button>
              </div>
            </div>
          </div>
        )}

        {/* GAME OVER SCREEN */}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-30">
            <div className="text-center p-10 border-4 border-neon-pink bg-black shadow-neon-pink">
              <h2 className="text-7xl text-neon-pink mb-4 italic uppercase font-black">Link_Severed</h2>
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
              <span className="flex-1 tracking-widest truncate mr-2 group-hover:text-white transition-colors">{entry.username.toUpperCase()}</span>
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
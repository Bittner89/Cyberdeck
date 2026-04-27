import React, { useRef, useEffect, useState } from 'react';
import { useSnakeLogic } from './useSnakeLogic';
import { audioService } from '../../services/audioService';
import { scoreService } from '../../services/scoreService';

export default function SnakeGame({ onExit, onGameOver }) {
  const canvasRef = useRef(null);
  const [hasBooted, setHasBooted] = useState(false);
  const [realHighscores, setRealHighscores] = useState([]);
  const width = 800;
  const height = 800;
  const grid = 25;

  const { 
    snake, food, score, highscore, gameOver, 
    setDirection, gridSize, isPaused, setIsPaused, resetGame 
  } = useSnakeLogic(width, height, grid, onGameOver);

  // Highscores laden
  useEffect(() => {
    scoreService.getHighscores().then(setRealHighscores);
  }, [gameOver]);

  // Musik stoppen, wenn das Spiel manuell verlassen wird
  const handleAbort = () => {
    audioService.stopMusic();
    onExit();
  };

  // Canvas Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

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

    // Essen
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff00ff';
    ctx.fillStyle = '#ff00ff';
    ctx.fillRect(food.x + 2, food.y + 2, gridSize - 4, gridSize - 4);

    // Schlange
    snake.forEach((part, i) => {
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00ffff';
      ctx.fillStyle = i === 0 ? '#fff' : '#00ffff';
      ctx.fillRect(part.x + 1, part.y + 1, gridSize - 2, gridSize - 2);
    });

    ctx.shadowBlur = 0;
  }, [snake, food, gridSize]);

  // Steuerung
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "Escape", "Enter"].includes(e.key)) {
        e.preventDefault();
      }

      if (!hasBooted && (e.key === 'Enter' || e.key === ' ')) {
        audioService.init(); 
        audioService.startMusic(); 
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

  return (
    <div className="flex flex-row gap-6 p-4 bg-black/60 border-2 border-neon-cyan shadow-neon-big animate-glitch-entry h-[850px]">
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
                <button onClick={resetGame} className="border-2 border-neon-cyan p-3 text-neon-cyan hover:bg-neon-cyan hover:text-black text-xl transition-all uppercase">Reboot</button>
                <button onClick={handleAbort} className="border-2 border-neon-pink p-3 text-neon-pink hover:bg-neon-pink hover:text-black text-xl transition-all uppercase">Exit</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* HIGHSCORES */}
      <div className="w-[300px] font-vt323 text-neon-cyan border border-neon-cyan/20 bg-neon-cyan/5 p-4 flex flex-col overflow-hidden">
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
      </div>
    </div>
  );
}
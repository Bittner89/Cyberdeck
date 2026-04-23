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

  // Lade echte Highscores für das Side-Panel
  useEffect(() => {
    scoreService.getHighscores().then(setRealHighscores);
  }, [gameOver]);

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

      if (!hasBooted) return;

      if (gameOver) {
        if (e.key === 'Enter') resetGame();
        if (e.key === 'Escape') onExit();
        return;
      }

      switch (e.key) {
        case 'ArrowUp': setDirection({ x: 0, y: -gridSize }); break;
        case 'ArrowDown': setDirection({ x: 0, y: gridSize }); break;
        case 'ArrowLeft': setDirection({ x: -gridSize, y: 0 }); break;
        case 'ArrowRight': setDirection({ x: gridSize, y: 0 }); break;
        case ' ': setIsPaused(p => !p); break;
        case 'Escape': onExit(); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasBooted, gameOver, gridSize, setDirection, setIsPaused, resetGame, onExit]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    // Food
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff00ff';
    ctx.fillStyle = '#ff00ff';
    ctx.fillRect(food.x + 2, food.y + 2, gridSize - 4, gridSize - 4);

    // Snake
    snake.forEach((part, i) => {
      ctx.shadowBlur = i === 0 ? 20 : 10;
      ctx.shadowColor = '#00ffff';
      ctx.fillStyle = i === 0 ? '#fff' : '#00ffff';
      ctx.fillRect(part.x + 1, part.y + 1, gridSize - 2, gridSize - 2);
    });
    ctx.shadowBlur = 0;
  }, [snake, food, gridSize]);

  return (
    <div className="flex gap-6 p-4 bg-black/90 border-2 border-neon-cyan shadow-neon-big animate-glitch-entry">
      <div className="relative group">
        <canvas ref={canvasRef} width={width} height={height} className="border border-neon-cyan/50 bg-black" />
        
        {!hasBooted && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="text-center animate-pulse">
              <h2 className="text-5xl font-vt323 text-neon-cyan mb-4 shadow-neon">INITIALIZING...</h2>
              <p className="text-neon-pink text-xl font-vt323">PRESS [ENTER] TO LINK START</p>
            </div>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-md border-2 border-neon-pink mx-20 my-40">
            <div className="text-center p-8">
              <h2 className="text-7xl font-vt323 text-neon-pink mb-2 animate-bounce shadow-neon">DISCONNECTED</h2>
              <p className="text-2xl text-neon-cyan font-vt323 mb-8 opacity-80">Final Score: {score}</p>
              <div className="flex flex-col gap-4">
                <button onClick={resetGame} className="border-2 border-neon-cyan p-3 text-neon-cyan hover:bg-neon-cyan hover:text-black text-xl transition-all uppercase tracking-widest">Re-Link [ENTER]</button>
                <button onClick={onExit} className="border-2 border-neon-pink p-3 text-neon-pink hover:bg-neon-pink hover:text-black text-xl transition-all">EXIT [ESC]</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="w-[300px] font-vt323 text-neon-cyan border border-neon-cyan/20 bg-neon-cyan/5 p-4 self-stretch flex flex-col overflow-hidden">
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
        <div className="mt-4 pt-4 border-t border-neon-cyan/30 bg-black/40 p-2">
          <div className="flex justify-between text-neon-pink animate-pulse"><span>SCORE:</span><span>{score}</span></div>
          <div className="flex justify-between text-neon-cyan opacity-70 mt-1"><span>BEST:</span><span>{highscore}</span></div>
        </div>
      </div>
    </div>
  );
}
import React, { useRef, useEffect, useState } from 'react';
import { useSnakeLogic } from './useSnakeLogic';
import { audioService } from '../../services/audioService';

export default function SnakeGame({ onExit }) {
  const canvasRef = useRef(null);
  const [hasBooted, setHasBooted] = useState(false);
  
  // Feste Auflösung wie gewünscht
  const width = 800;
  const height = 800;

  // Wir nutzen jetzt eine größere gridSize von 25px statt 10px
  const { 
    snake, food, score, highscore, gameOver, isNewRecord, 
    setDirection, gridSize, isPaused, setIsPaused 
  } = useSnakeLogic(width, height, 25); 

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
      if (hasBooted && isPaused && !gameOver && e.key) {
        setIsPaused(false);
        audioService.playFX('confirm');
      }
      switch (e.key) {
        case 'ArrowUp':    setDirection({ x: 0, y: -25 }); break;
        case 'ArrowDown':  setDirection({ x: 0, y: 25 }); break;
        case 'ArrowLeft':  setDirection({ x: -25, y: 0 }); break;
        case 'ArrowRight': setDirection({ x: 25, y: 0 }); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setDirection, hasBooted, isPaused, gameOver, setIsPaused]);

  useEffect(() => {
    if (!hasBooted || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Hintergrund
    ctx.fillStyle = "#010808";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Raster zeichnen (skaliert auf 25px)
    ctx.strokeStyle = "rgba(0, 243, 255, 0.05)";
    for (let x = 0; x <= canvas.width; x += 25) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += 25) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Food (Glow Effekt)
    ctx.shadowBlur = 20; ctx.shadowColor = "#ff00ff";
    ctx.fillStyle = "#ff00ff";
    ctx.fillRect(food.x + 2, food.y + 2, 21, 21);

    // Snake
    snake.forEach((part, i) => {
      ctx.shadowBlur = i === 0 ? 30 : 10; ctx.shadowColor = "#00f3ff";
      ctx.fillStyle = i === 0 ? "#fff" : "rgba(0, 243, 255, 0.8)";
      ctx.fillRect(part.x + 2, part.y + 2, 21, 21);
    });

  }, [snake, food, hasBooted]);

  if (!hasBooted) {
    return (
      <div className="flex flex-col items-center justify-center font-vt323 text-neon-cyan">
        <h2 className="text-4xl mb-8 tracking-widest animate-pulse">SNAKE_OS_800XL</h2>
        <button 
          onClick={() => { audioService.init(); audioService.startMusic(); setHasBooted(true); }}
          className="border-2 border-neon-cyan px-12 py-3 hover:bg-neon-cyan hover:text-black transition-all uppercase"
        >
          Initialize
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-auto p-4">
      <div className="absolute top-6 left-10 font-vt323 text-neon-cyan text-3xl z-20 drop-shadow-[0_0_5px_rgba(0,243,255,0.8)]">
        SCORE: {score}
      </div>

      {/* Das Canvas ist jetzt groß */}
      <canvas 
        ref={canvasRef} 
        width={width} 
        height={height} 
        className="border-4 border-neon-cyan/20 bg-black max-w-full max-h-full object-contain shadow-[0_0_50px_rgba(0,243,255,0.1)]"
      />
      
      {isPaused && !gameOver && (
        <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/40">
          <p className="font-vt323 text-neon-cyan text-4xl animate-pulse">READY_</p>
        </div>
      )}

      {gameOver && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-50 font-vt323">
          <h2 className="text-neon-pink text-7xl mb-4">CRASHED</h2>
          <p className="text-white text-3xl mb-10 tracking-widest">FINAL_SCORE: {score}</p>
          <div className="flex space-x-6">
            <button onClick={() => window.location.reload()} className="border-2 border-neon-cyan px-8 py-3 text-neon-cyan hover:bg-neon-cyan hover:text-black text-xl">REBOOT</button>
            <button onClick={onExit} className="border-2 border-neon-pink px-8 py-3 text-neon-pink hover:bg-neon-pink hover:text-black text-xl">EXIT</button>
          </div>
        </div>
      )}
    </div>
  );
}
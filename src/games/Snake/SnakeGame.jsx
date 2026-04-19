import React, { useRef, useEffect, useState } from 'react';
import { useSnakeLogic } from './useSnakeLogic';
import { audioService } from '../../services/audioService';

export default function SnakeGame({ onExit }) {
  const canvasRef = useRef(null);
  const [hasBooted, setHasBooted] = useState(false);
  
  // Feste Auflösung für das Spielfeld
  const width = 800;
  const height = 800;
  const grid = 25; // gridSize

  const { 
    snake, food, score, highscore, gameOver, 
    setDirection, gridSize, isPaused, setIsPaused 
  } = useSnakeLogic(width, height, grid); 

  // Key-Handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
      
      if (hasBooted && isPaused && !gameOver && e.key) {
        setIsPaused(false);
        audioService.playFX('confirm');
      }

      switch (e.key) {
        case 'ArrowUp':    setDirection({ x: 0, y: -gridSize }); break;
        case 'ArrowDown':  setDirection({ x: 0, y: gridSize }); break;
        case 'ArrowLeft':  setDirection({ x: -gridSize, y: 0 }); break;
        case 'ArrowRight': setDirection({ x: gridSize, y: 0 }); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setDirection, gridSize, hasBooted, isPaused, gameOver]);

  // Zeichen-Loop (Optimiert)
  useEffect(() => {
    if (!hasBooted || !canvasRef.current) return;
    
    const canvas = canvasRef.current; // Hier definieren wir 'canvas' lokal
    const ctx = canvas.getContext('2d');

    // Hintergrund löschen
    ctx.fillStyle = "#010808";
    ctx.fillRect(0, 0, width, height);

    // Raster (Scanlines-Optik)
    ctx.strokeStyle = "rgba(0, 243, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    // Food
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#ff00ff";
    ctx.fillStyle = "#ff00ff";
    ctx.fillRect(food.x + 2, food.y + 2, gridSize - 4, gridSize - 4);

    // Snake
    snake.forEach((part, i) => {
      ctx.shadowBlur = i === 0 ? 25 : 10;
      ctx.shadowColor = "#00f3ff";
      ctx.fillStyle = i === 0 ? "#fff" : "rgba(0, 243, 255, 0.8)";
      ctx.fillRect(part.x + 2, part.y + 2, gridSize - 4, gridSize - 4);
    });
    
    // Shadow Reset für Performance
    ctx.shadowBlur = 0;

  }, [snake, food, hasBooted, gridSize]); // Re-render nur wenn sich Daten ändern

  if (!hasBooted) {
    return (
      <div className="flex flex-col items-center justify-center font-vt323 text-neon-cyan">
        <h2 className="text-5xl mb-8 tracking-[0.2em] animate-pulse">SNAKE_OS_800</h2>
        <button 
          onClick={() => { audioService.init(); audioService.startMusic(); setHasBooted(true); }}
          className="border-2 border-neon-cyan px-12 py-3 hover:bg-neon-cyan hover:text-black transition-all uppercase text-xl"
        >
          Initialize_Core
        </button>
      </div>
    );
  }

  return (
  <div className="flex flex-col items-center justify-center p-4 h-full animate-fade-in">
    
    {/* OBERER BEREICH: HUD (Score & Highscore) */}
    <div 
      className="flex justify-between items-end font-vt323 text-neon-cyan pb-4"
      style={{ width: '1120px', maxWidth: '100%' }} // 800px (Game) + 20px (Gap) + 300px (Leaderboard)
    >
      <div className="flex flex-col">
        <span className="text-[10px] opacity-50 uppercase tracking-widest">Active_Session_Score</span>
        <span className="text-6xl text-glow leading-none">{score}</span>
      </div>
      <div className="text-right opacity-20">
        <span className="text-[10px] uppercase">System_Unit</span>
        <p className="text-xl">NX-800-SNAKE</p>
      </div>
    </div>

    {/* HAUPT-BEREICH: SPIELFELD & SIDEBAR */}
    <div className="flex flex-row gap-6 items-start">
      
      {/* LINKSE SEITE: DAS SPIELFELD */}
      <div className="relative border-4 border-neon-cyan/20 shadow-[0_0_60px_rgba(0,243,255,0.1)]"> 
        <canvas 
          ref={canvasRef} 
          width={width} 
          height={height} 
          className="bg-black block max-w-full max-h-[75vh] object-contain"
        />

        {/* OVERLAYS (Pause & Game Over) */}
        {isPaused && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
            <p className="font-vt323 text-neon-cyan text-5xl animate-pulse tracking-[0.3em]">READY_</p>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center z-50 font-vt323">
            <h2 className="text-neon-pink text-7xl mb-4 text-glow-pink">CONNECTION_LOST</h2>
            <p className="text-white text-2xl mb-10 opacity-80 uppercase tracking-tighter">Data_Extracted: {score}</p>
            <div className="flex gap-4">
              <button onClick={() => window.location.reload()} className="border-2 border-neon-cyan px-8 py-3 text-neon-cyan hover:bg-neon-cyan hover:text-black text-xl transition-all">REBOOT</button>
              <button onClick={onExit} className="border-2 border-neon-pink px-8 py-3 text-neon-pink hover:bg-neon-pink hover:text-black text-xl transition-all">EXIT</button>
            </div>
          </div>
        )}
      </div>

      {/* RECHTE SEITE: TOP 10 HIGHSCORES */}
<div className="w-[300px] font-vt323 text-neon-cyan border border-neon-cyan/20 bg-neon-cyan/5 p-4 self-stretch flex flex-col overflow-hidden">
  <h3 className="text-2xl border-b border-neon-cyan/30 pb-2 mb-4 italic uppercase tracking-tighter shadow-neon">
    Top_10_Agents
  </h3>
  
  <div className="flex-1 space-y-2">
    {[
      { n: "NEO", s: 2500 }, { n: "TRINITY", s: 2100 }, { n: "MORPHEUS", s: 1950 },
      { n: "SMITH", s: 1800 }, { n: "ORACLE", s: 1500 }, { n: "NIOBE", s: 1200 },
      { n: "GHOST", s: 950 }, { n: "KEYMAKER", s: 800 }, { n: "LINK", s: 650 },
      { n: "TANK", s: 500 }
    ].map((entry, i) => (
      <div key={i} className="flex items-center text-lg border-b border-neon-cyan/5 pb-1 group hover:bg-neon-cyan/10 px-1">
        {/* Die Änderung: 'inline-block' und feste Breite 'w-10' verhindert das Verschieben */}
        <span className="opacity-40 inline-block w-10 shrink-0">
          #{String(i + 1).padStart(2, '0')}
        </span>
        
        {/* 'truncate' sorgt dafür, dass zu lange Namen das Layout nicht sprengen */}
        <span className="flex-1 tracking-widest group-hover:text-white transition-colors truncate mr-2">
          {entry.n}
        </span>
        
        <span className="text-white shrink-0 tabular-nums">
          {entry.s.toLocaleString()}
        </span>
      </div>
    ))}
  </div>

  <div className="mt-4 pt-2 border-t border-neon-cyan/20 text-[10px] opacity-30 text-center uppercase tracking-[0.2em]">
    Live_Global_Feed_Active
  </div>
</div>

    </div>
  </div>
);
}
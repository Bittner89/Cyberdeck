import React, { useRef, useEffect, useState } from 'react';
import { useTetrisLogic } from './useTetrisLogic';
import { audioService } from '../../services/audioService';
import { scoreService, ScoreEntry } from '../../services/scoreService';
import { useAppContext } from '../../context/AppContext';

interface TetrisGameProps {
  onGameOver: (score: number) => void;
}

export default function TetrisGame({ onGameOver }: TetrisGameProps) {
  const { navigate } = useAppContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasBooted, setHasBooted] = useState(false);
  const [realHighscores, setRealHighscores] = useState<ScoreEntry[]>([]);
  const width = 800;
  const height = 800;

  const { 
    board, piece, score, gameOver, isPaused, setIsPaused, 
    move, drop, playerRotate, resetGame, colors, offset, blockSize, gridW, gridH 
  } = useTetrisLogic(width, height);

  // Highscores laden
  useEffect(() => {
    scoreService.getHighscores('tetris').then(setRealHighscores);
  }, [gameOver]);

  // Musik stoppen, wenn das Spiel manuell verlassen wird
  const handleAbort = () => {
    audioService.stopMusic();
    navigate('menu');
  };

  // Steuerung
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "Escape", "Enter"].includes(e.key)) e.preventDefault();

      if (!hasBooted && (e.key === 'Enter' || e.key === ' ')) {
        audioService.init();
        setHasBooted(true);
        resetGame();
        return;
      }
      if (!hasBooted || gameOver) return;

      if (e.key === 'Escape') {
        setIsPaused(p => !p);
        return;
      }

      if (!isPaused) {
        switch (e.key) {
          case 'ArrowLeft':  move(-1); break;
          case 'ArrowRight': move(1); break;
          case 'ArrowDown':  drop(); break;
          case 'ArrowUp':    playerRotate(); break;
          case ' ':          playerRotate(); break; // Space für Rotation
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasBooted, isPaused, gameOver, move, drop, playerRotate, resetGame]);

  // Zeichnen
  useEffect(() => {
    if (!hasBooted || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    // Background & Grid
    ctx.fillStyle = "#010808";
    ctx.fillRect(0, 0, width, height);
    
    ctx.strokeStyle = "rgba(0, 243, 255, 0.1)";
    ctx.strokeRect(offset.x, offset.y, gridW * blockSize, gridH * blockSize);

    // Board zeichnen
    board.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          drawBlock(ctx, x, y, colors[value] as string);
        }
      });
    });

    // Aktuelles Piece zeichnen
    if (piece) {
      piece.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            drawBlock(ctx, x + piece.pos.x, y + piece.pos.y, colors[value] as string);
          }
        });
      });
    }
  }, [board, piece, hasBooted]);

  const drawBlock = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.fillRect(offset.x + x * blockSize + 1, offset.y + y * blockSize + 1, blockSize - 2, blockSize - 2);
    ctx.shadowBlur = 0;
  };

  return (
    <div className="flex flex-row gap-6 p-4 bg-black/60 border-2 border-neon-cyan shadow-neon-big animate-glitch-entry h-212.5">
      <div className="relative border-4 border-neon-cyan/50 shadow-neon">
        <canvas ref={canvasRef} width={width} height={height} className="bg-black" />

        {/* START SCREEN */}
        {!hasBooted && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20">
            <div className="text-center p-8 border-2 border-neon-cyan animate-pulse">
              <h2 className="text-6xl text-neon-cyan mb-8 tracking-tighter uppercase italic">NEURAL_TETRIS_v1</h2>
              <p className="text-2xl text-neon-pink animate-bounce mb-4">PRESS [ENTER] TO CONNECT</p>
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
                  onClick={handleAbort}
                  className="border-2 border-neon-pink p-4 text-neon-pink hover:bg-neon-pink hover:text-black text-2xl transition-all uppercase"
                >
                  Abort_Mission [Exit]
                </button>
              </div>
            </div>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center font-vt323">
            <h2 className="text-neon-pink text-7xl mb-4 shadow-neon-pink">CORE_CRASH</h2>
            <button onClick={() => onGameOver(score)} className="border-2 border-neon-cyan p-4 text-neon-cyan hover:bg-neon-cyan hover:text-black transition-all">UPLOAD_SCORE</button>
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
import React, { useRef, useEffect, useState } from 'react';
import { useTetrisLogic } from './useTetrisLogic';
import { audioService } from '../../services/audioService';
import { scoreService, ScoreEntry } from '../../services/scoreService';
import { useAppContext } from '../../context/AppContext';
import { useIsMobile } from '../../hooks/useIsMobile';

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

  const isMobile = useIsMobile();

  const { 
    board, piece, nextPiece, score, gameOver, isPaused, setIsPaused, 
    move, drop, playerRotate, resetGame, colors, offset, blockSize, gridW, gridH 
  } = useTetrisLogic(width, height);

  // Highscores laden
  useEffect(() => {
    scoreService.getHighscores('tetris').then(setRealHighscores);
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

  const handleRestart = () => {
    resetGame();
    setHasBooted(false);
    audioService.stopMusic();
  };

  // Steuerung
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "Escape", "Enter"].includes(e.key)) e.preventDefault();

      if (!hasBooted && (e.key === 'Enter' || e.key === ' ')) {
        audioService.init();
        resetGame();
        setHasBooted(true);
        setIsPaused(false);
        audioService.startMusic('tetris');
        return;
      }
      if (!hasBooted) return;

      if (gameOver) {
        if (e.key.toLowerCase() === 'r') handleRestart();
        if (e.key.toLowerCase() === 'q') handleAbort();
        return;
      }

      if (e.key === 'Escape') {
        setIsPaused(p => !p);
        return;
      }

      if (isPaused) {
        if (e.key.toLowerCase() === 'r') handleRestart();
        if (e.key.toLowerCase() === 'q') {
          audioService.stopMusic();
          navigate('menu');
        }
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
  }, [hasBooted, isPaused, gameOver, move, drop, playerRotate, resetGame, navigate]);

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

    // Inneres Raster (Grid)
    ctx.strokeStyle = "rgba(0, 243, 255, 0.05)";
    ctx.beginPath();
    for (let x = 1; x < gridW; x++) {
      ctx.moveTo(offset.x + x * blockSize, offset.y);
      ctx.lineTo(offset.x + x * blockSize, offset.y + gridH * blockSize);
    }
    for (let y = 1; y < gridH; y++) {
      ctx.moveTo(offset.x, offset.y + y * blockSize);
      ctx.lineTo(offset.x + gridW * blockSize, offset.y + y * blockSize);
    }
    ctx.stroke();

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

    // Next Piece Preview
    if (nextPiece) {
      const previewOffsetX = offset.x + gridW * blockSize + 40;
      const previewOffsetY = offset.y + 40;
      
      ctx.fillStyle = "rgba(0, 243, 255, 0.5)";
      ctx.font = "24px VT323";
      ctx.fillText("NEXT_BLOCK", previewOffsetX, previewOffsetY - 15);

      nextPiece.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = colors[value] as string;
            ctx.fillStyle = colors[value] as string;
            ctx.fillRect(previewOffsetX + x * blockSize + 1, previewOffsetY + y * blockSize + 1, blockSize - 2, blockSize - 2);
          }
        });
      });
      ctx.shadowBlur = 0;
    }
  }, [board, piece, nextPiece, hasBooted]);

  const drawBlock = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.fillRect(offset.x + x * blockSize + 1, offset.y + y * blockSize + 1, blockSize - 2, blockSize - 2);
    ctx.shadowBlur = 0;
  };

  // --- MOBILE VERSION ---
  if (isMobile) {
    return (
      <div className="flex flex-col w-full h-full max-h-full overflow-hidden relative bg-black z-20">
        <div className="relative w-full flex-1 min-h-0 flex items-center justify-center bg-black overflow-hidden">
          <canvas ref={canvasRef} width={width} height={height} className="w-full h-full object-contain" />

          {!hasBooted && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20">
              <div className="text-center p-4 border border-neon-cyan animate-pulse">
                <h2 className="text-3xl text-neon-cyan mb-4 italic">BLOCK_ENCRYPT</h2>
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
              <h2 className="text-neon-pink text-6xl mb-6 shadow-neon-pink uppercase">CORE_CRASH</h2>
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
          <div className="flex flex-col items-end">
            <span className="text-[10px] opacity-50 uppercase tracking-widest leading-none mb-1">Current_Score</span>
            <span className="text-3xl text-neon-pink [text-shadow:0_0_15px_rgba(255,0,255,0.8)] tabular-nums leading-none">{score}</span>
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
                  onClick={handleRestart}
                  className="border-2 border-neon-cyan p-4 text-neon-cyan hover:bg-neon-cyan hover:text-black text-2xl transition-all uppercase"
                >
                  Restart_Mission [R]
                </button>
                <button 
                  onClick={handleAbort}
                  className="border-2 border-neon-pink p-4 text-neon-pink hover:bg-neon-pink hover:text-black text-2xl transition-all uppercase"
                >
                  Return_to_Dashboard [Q]
                </button>
              </div>
            </div>
          </div>
        )}

        {/* GAME OVER SCREEN */}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-30">
            <div className="text-center p-10 border-4 border-neon-pink bg-black shadow-neon-pink">
              <h2 className="text-7xl text-neon-pink mb-4 italic uppercase font-black">CORE_CRASH</h2>
              <p className="text-3xl text-white mb-8 uppercase tracking-widest">Final_Score: {score}</p>
              <div className="flex gap-4 justify-center">
                <button onClick={handleRestart} className="border-2 border-neon-cyan p-3 text-neon-cyan hover:bg-neon-cyan hover:text-black text-xl transition-all uppercase">REBOOT [R]</button>
                <button onClick={handleAbort} className="border-2 border-neon-pink p-3 text-neon-pink hover:bg-neon-pink hover:text-black text-xl transition-all uppercase">DASHBOARD [Q]</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* HIGHSCORES */}
      <div className="w-72 shrink-0 font-vt323 text-neon-cyan border border-neon-cyan/20 bg-neon-cyan/5 p-4 flex flex-col overflow-hidden">
        <h3 className="shrink-0 text-2xl border-b border-neon-cyan/30 pb-2 mb-4 italic uppercase tracking-tighter shadow-neon">Top_10_Agents</h3>
        <div className="flex-1 space-y-2 overflow-y-auto min-h-0 custom-scrollbar pr-2">
          {realHighscores.map((entry, i) => (
            <div key={entry.id} className="flex items-center text-lg border-b border-neon-cyan/5 pb-1 group hover:bg-neon-cyan/10 px-1">
              <span className="opacity-40 inline-block w-10 shrink-0">#{String(i + 1).padStart(2, '0')}</span>
              <span className="flex-1 tracking-widest truncate mr-2 group-hover:text-white transition-colors">{entry.username.toUpperCase()}</span>
              <span className="text-white shrink-0 tabular-nums">{entry.score}</span>
            </div>
          ))}
        </div>

        {/* CURRENT SCORE DISPLAY */}
        <div className="shrink-0 mt-4 pt-4 border-t border-neon-cyan/30 text-right">
          <p className="text-sm opacity-50 uppercase tracking-widest mb-1">Current_Score</p>
          <p className="text-6xl text-neon-pink [text-shadow:0_0_15px_rgba(255,0,255,0.8)] tabular-nums leading-none">{score}</p>
        </div>
      </div>
    </div>
  );
}
import React, { useRef, useEffect, useState } from 'react';
import { useTetrisLogic } from './useTetrisLogic';
import { audioService } from '../../services/audioService';

export default function TetrisGame({ onExit, onGameOver }) {
  const canvasRef = useRef(null);
  const [hasBooted, setHasBooted] = useState(false);
  const width = 800;
  const height = 800;

  const { 
    board, piece, score, gameOver, isPaused, setIsPaused, 
    move, drop, playerRotate, resetGame, colors, offset, blockSize, gridW, gridH 
  } = useTetrisLogic(width, height);

  // Steuerung
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "Escape", "Enter"].includes(e.key)) e.preventDefault();

      if (!hasBooted && (e.key === 'Enter' || e.key === ' ')) {
        audioService.init();
        setHasBooted(true);
        resetGame();
        return;
      }
      if (!hasBooted || gameOver) return;

      if (e.key === 'Escape') setIsPaused(p => !p);
      if (isPaused) return;

      switch (e.key) {
        case 'ArrowLeft':  move(-1); break;
        case 'ArrowRight': move(1); break;
        case 'ArrowDown':  drop(); break;
        case 'ArrowUp':    playerRotate(); break;
        case ' ':          playerRotate(); break; // Space für Rotation
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasBooted, isPaused, gameOver, move, drop, playerRotate, resetGame]);

  // Zeichnen
  useEffect(() => {
    if (!hasBooted || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    
    // Background & Grid
    ctx.fillStyle = "#010808";
    ctx.fillRect(0, 0, width, height);
    
    ctx.strokeStyle = "rgba(0, 243, 255, 0.1)";
    ctx.strokeRect(offset.x, offset.y, gridW * blockSize, gridH * blockSize);

    // Board zeichnen
    board.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          drawBlock(ctx, x, y, colors[value]);
        }
      });
    });

    // Aktuelles Piece zeichnen
    if (piece) {
      piece.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            drawBlock(ctx, x + piece.pos.x, y + piece.pos.y, colors[value]);
          }
        });
      });
    }
  }, [board, piece, hasBooted]);

  const drawBlock = (ctx, x, y, color) => {
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.fillRect(offset.x + x * blockSize + 1, offset.y + y * blockSize + 1, blockSize - 2, blockSize - 2);
    ctx.shadowBlur = 0;
  };

  if (!hasBooted) {
    return (
      <div className="text-center font-vt323 text-neon-cyan">
        <h2 className="text-6xl mb-4 animate-pulse">NEURAL_TETRIS_v1</h2>
        <p className="opacity-50">[ PRESS ENTER TO CONNECT ]</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center">
      <div className="absolute top-4 left-4 font-vt323 text-neon-cyan">
        <p className="text-xs opacity-50 uppercase">Data_Stream_Score</p>
        <p className="text-5xl shadow-neon">{score}</p>
      </div>

      <canvas ref={canvasRef} width={width} height={height} className="border-2 border-neon-cyan/20 bg-black shadow-neon-big" />

      {gameOver && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center font-vt323">
          <h2 className="text-neon-pink text-7xl mb-4 shadow-neon-pink">CORE_CRASH</h2>
          <button onClick={() => { onGameOver(score); onExit(); }} className="border-2 border-neon-cyan p-4 text-neon-cyan hover:bg-neon-cyan hover:text-black transition-all">UPLOAD_SCORE & EXIT</button>
        </div>
      )}
    </div>
  );
}
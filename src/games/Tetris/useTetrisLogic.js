import { useState, useEffect, useCallback, useRef } from 'react';
import { audioService } from '../../services/audioService';

export function useTetrisLogic(canvasWidth, canvasHeight) {
  const gridW = 10;
  const gridH = 20;
  const blockSize = 35; // Skaliert für dein 800x800 Feld
  const offset = { x: (canvasWidth - gridW * blockSize) / 2, y: 50 };

  const shapes = [
    [],
    [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], // I
    [[2, 0, 0], [2, 2, 2], [0, 0, 0]], // J
    [[0, 0, 3], [3, 3, 3], [0, 0, 0]], // L
    [[4, 4], [4, 4]], // O
    [[0, 5, 5], [5, 5, 0], [0, 0, 0]], // S
    [[0, 6, 0], [6, 6, 6], [0, 0, 0]], // T
    [[7, 7, 0], [0, 7, 7], [0, 0, 0]], // Z
  ];

  const colors = [
    null, "#00f3ff", "#ff00ff", "#00ff41", "#ffee00", "#ff0055", "#0055ff", "#ffffff"
  ];

  const [board, setBoard] = useState(Array(gridH).fill().map(() => Array(gridW).fill(0)));
  const [piece, setPiece] = useState(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);

  const lastUpdateTime = useRef(0);
  const dropInterval = 800;

  const spawnPiece = useCallback(() => {
    const id = Math.ceil(Math.random() * 7);
    const newPiece = { matrix: shapes[id], pos: { x: 3, y: 0 }, id };
    
    setPiece(newPiece);
    // Kollisions-Check sofort nach Spawn
    setBoard(prevBoard => {
      if (collide(prevBoard, newPiece)) {
        setGameOver(true);
        audioService.playFX('crash');
        audioService.stopMusic();
      }
      return prevBoard;
    });
  }, []);

  const collide = (board, piece) => {
    const m = piece.matrix;
    const o = piece.pos;
    for (let y = 0; y < m.length; ++y) {
      for (let x = 0; x < m[y].length; ++x) {
        if (m[y][x] !== 0 && (board[y + o.y] === undefined || board[y + o.y][x + o.x] === undefined || board[y + o.y][x + o.x] !== 0)) {
          return true;
        }
      }
    }
    return false;
  };

  const rotate = (matrix) => {
    return matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
  };

  const playerRotate = () => {
    if (!piece || isPaused) return;
    const originalPos = piece.pos.x;
    let offsetMove = 1;
    const newMatrix = rotate(piece.matrix);
    const newPiece = { ...piece, matrix: newMatrix };

    while (collide(board, newPiece)) {
      newPiece.pos.x += offsetMove;
      offsetMove = -(offsetMove + (offsetMove > 0 ? 1 : -1));
      if (offsetMove > piece.matrix[0].length) {
        return; // Rotation unmöglich
      }
    }
    setPiece(newPiece);
    audioService.playFX('select');
  };

  const sweep = (newBoard) => {
    let rowsCleared = 0;
    const sweptBoard = newBoard.reduce((acc, row) => {
      if (row.every(value => value !== 0)) {
        rowsCleared++;
        acc.unshift(Array(gridW).fill(0));
        return acc;
      }
      acc.push(row);
      return acc;
    }, []);

    if (rowsCleared > 0) {
      setScore(s => s + (rowsCleared * 100));
      audioService.playFX('score');
    }
    return sweptBoard;
  };

  const drop = useCallback(() => {
    if (gameOver || isPaused || !piece) return;

    const newPiece = { ...piece, pos: { ...piece.pos, y: piece.pos.y + 1 } };
    
    if (collide(board, newPiece)) {
      // Merge
      const newBoard = board.map(row => [...row]);
      piece.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            newBoard[y + piece.pos.y][x + piece.pos.x] = piece.id;
          }
        });
      });
      setBoard(sweep(newBoard));
      spawnPiece();
    } else {
      setPiece(newPiece);
    }
  }, [board, piece, gameOver, isPaused, spawnPiece]);

  const move = (dir) => {
    if (!piece || isPaused) return;
    const newPiece = { ...piece, pos: { ...piece.pos, x: piece.pos.x + dir } };
    if (!collide(board, newPiece)) {
      setPiece(newPiece);
    }
  };

  const resetGame = () => {
    setBoard(Array(gridH).fill().map(() => Array(gridW).fill(0)));
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    spawnPiece();
    audioService.startMusic();
  };

  useEffect(() => {
    let requestRef;
    const animate = (time) => {
      if (!gameOver && !isPaused) {
        if (time - lastUpdateTime.current > dropInterval) {
          drop();
          lastUpdateTime.current = time;
        }
      }
      requestRef = requestAnimationFrame(animate);
    };
    requestRef = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef);
  }, [drop, gameOver, isPaused]);

  return { board, piece, score, gameOver, isPaused, setIsPaused, move, drop, playerRotate, resetGame, colors, offset, blockSize, gridW, gridH };
}
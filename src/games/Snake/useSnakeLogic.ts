import { useState, useEffect, useCallback, useRef } from 'react';
import { scoreService } from '../../services/scoreService';
import { audioService } from '../../services/audioService';

export interface Position {
  x: number;
  y: number;
}

export function useSnakeLogic(canvasWidth: number, canvasHeight: number, gridSize: number = 25) {
  // Start-Konfiguration
  const initialSnake = [
    { x: gridSize * 5, y: gridSize * 5 }, 
    { x: gridSize * 4, y: gridSize * 5 }
  ];
  const initialDir = { x: gridSize, y: 0 };

  // States
  const [snake, setSnake] = useState<Position[]>(initialSnake);
  const [food, setFood] = useState<Position>({ x: gridSize * 10, y: gridSize * 10 });
  const currentDirection = useRef<Position>(initialDir);
  const directionQueue = useRef<Position[]>([]);
  const [score, setScore] = useState(0);
  const [highscore, setHighscore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);

  const lastUpdateTime = useRef(0);
  const gameSpeed = 85; 

  // Highscore laden
  useEffect(() => {
    scoreService.getHighscores().then(scores => {
      if (scores.length > 0) setHighscore(scores[0].score);
    });
  }, []);

  // Spiel-Reset
  const resetGame = useCallback(() => {
    setSnake(initialSnake);
    currentDirection.current = initialDir;
    directionQueue.current = [];
    setFood({ x: gridSize * 10, y: gridSize * 10 });
    setScore(0);
    setGameOver(false);
    setIsPaused(true);
  }, [gridSize]);

  // Futter-Position
  const createFood = useCallback(() => {
    const x = Math.floor(Math.random() * (canvasWidth / gridSize)) * gridSize;
    const y = Math.floor(Math.random() * (canvasHeight / gridSize)) * gridSize;
    return { x, y };
  }, [canvasWidth, canvasHeight, gridSize]);

  // Input Buffering: Richtungen sicher einreihen
  const setDirection = useCallback((newDir: Position) => {
    const lastDir = directionQueue.current.length > 0 
      ? directionQueue.current[directionQueue.current.length - 1] 
      : currentDirection.current;

    // Verhindere 180-Grad-Drehungen (Rückwärtslaufen in sich selbst)
    if (lastDir.x !== 0 && lastDir.x === -newDir.x) return;
    if (lastDir.y !== 0 && lastDir.y === -newDir.y) return;
    
    // Maximal 3 Eingaben puffern (verhindert Input-Spamming)
    if (directionQueue.current.length < 3) {
      if (lastDir.x !== newDir.x || lastDir.y !== newDir.y) {
        directionQueue.current.push(newDir);
      }
    }
  }, []);

  // Bewegungs-Logik
  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    if (directionQueue.current.length > 0) {
      currentDirection.current = directionQueue.current.shift()!;
    }
    const dir = currentDirection.current;

    setSnake(prevSnake => {
      const head = { x: prevSnake[0].x + dir.x, y: prevSnake[0].y + dir.y };

      if (head.x < 0 || head.x >= canvasWidth || head.y < 0 || head.y >= canvasHeight ||
          prevSnake.some(p => p.x === head.x && p.y === head.y)) {
        setGameOver(true);
        audioService.stopMusic(); // Musik stoppt bei Game Over
        audioService.playFX('crash');
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];
      if (head.x === food.x && head.y === food.y) {
        setScore(s => s + 10);
        setFood(createFood());
        audioService.playFX('score');
      } else {
        newSnake.pop();
      }
      return newSnake;
    });
  }, [food, gameOver, isPaused, createFood, canvasWidth, canvasHeight, gridSize]);

  // Game-Loop
  useEffect(() => {
    let requestRef: number;
    const animate = (time: number) => {
      if (!gameOver && !isPaused) {
        const deltaTime = time - lastUpdateTime.current;
        if (deltaTime > gameSpeed) {
          moveSnake();
          lastUpdateTime.current = time;
        }
      }
      requestRef = requestAnimationFrame(animate);
    };
    requestRef = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef);
  }, [moveSnake, gameOver, isPaused]);

  return { 
    snake, food, score, highscore, gameOver, 
    setDirection, gridSize, isPaused, setIsPaused, resetGame 
  };
}
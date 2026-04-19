import { useState, useEffect, useCallback, useRef } from 'react';
import { scoreService } from '../../services/scoreService';
import { audioService } from '../../services/audioService';

export function useSnakeLogic(canvasWidth, canvasHeight, gridSize = 25) {
  const [snake, setSnake] = useState([
    { x: gridSize * 5, y: gridSize * 5 }, 
    { x: gridSize * 4, y: gridSize * 5 }
  ]);
  const [food, setFood] = useState({ x: gridSize * 10, y: gridSize * 10 });
  const [direction, setDirection] = useState({ x: gridSize, y: 0 });
  const [score, setScore] = useState(0);
  const [highscore, setHighscore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);

  const lastProcessedDirection = useRef({ x: gridSize, y: 0 });
  const lastUpdateTime = useRef(0);
  // SPEED: Je niedriger die Zahl, desto schneller (80ms ist sehr flüssig)
  const gameSpeed = 85; 

  useEffect(() => {
    scoreService.getHighscore().then(setHighscore);
  }, []);

  const createFood = useCallback(() => {
    const cols = Math.floor(canvasWidth / gridSize);
    const rows = Math.floor(canvasHeight / gridSize);
    return {
      x: Math.floor(Math.random() * cols) * gridSize,
      y: Math.floor(Math.random() * rows) * gridSize,
    };
  }, [canvasWidth, canvasHeight, gridSize]);

  // Die eigentliche Bewegungs-Logik (unverändert, aber optimiert aufgerufen)
  const moveSnake = useCallback(() => {
    setSnake((prevSnake) => {
      const head = { x: prevSnake[0].x + direction.x, y: prevSnake[0].y + direction.y };
      lastProcessedDirection.current = direction;

      if (head.x < 0 || head.x >= canvasWidth || head.y < 0 || head.y >= canvasHeight ||
          prevSnake.some(p => p.x === head.x && p.y === head.y)) {
        setGameOver(true);
        audioService.stopMusic();
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
  }, [direction, food, canvasWidth, canvasHeight, gridSize, createFood]);

  // High-Performance Game Loop
  useEffect(() => {
    let requestRef;

    const animate = (time) => {
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

  const setSafeDirection = useCallback((newDir) => {
    const isOpposite = 
      (newDir.x !== 0 && newDir.x === -lastProcessedDirection.current.x) ||
      (newDir.y !== 0 && newDir.y === -lastProcessedDirection.current.y);

    if (!isOpposite) setDirection(newDir);
  }, []);

  return { 
    snake, food, score, highscore, gameOver, 
    setDirection: setSafeDirection, gridSize, isPaused, setIsPaused 
  };
}
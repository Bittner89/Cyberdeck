import { useState, useEffect, useCallback, useRef } from 'react';
import { scoreService } from '../../services/scoreService';
import { audioService } from '../../services/audioService';

export function useSnakeLogic(canvasWidth, canvasHeight, gridSize = 25, onGameOver) {
  // Start-Konfiguration
  const initialSnake = [
    { x: gridSize * 5, y: gridSize * 5 }, 
    { x: gridSize * 4, y: gridSize * 5 }
  ];
  const initialDir = { x: gridSize, y: 0 };

  // States
  const [snake, setSnake] = useState(initialSnake);
  const [food, setFood] = useState({ x: gridSize * 10, y: gridSize * 10 });
  const [direction, setDirection] = useState(initialDir);
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

  // Game Over an App melden
  useEffect(() => {
    if (gameOver && onGameOver) onGameOver(score);
  }, [gameOver, score, onGameOver]);

  // Spiel-Reset
  const resetGame = useCallback(() => {
    setSnake(initialSnake);
    setDirection(initialDir);
    setFood({ x: gridSize * 10, y: gridSize * 10 });
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    audioService.startMusic();
  }, [gridSize]);

  // Futter-Position
  const createFood = useCallback(() => {
    const x = Math.floor(Math.random() * (canvasWidth / gridSize)) * gridSize;
    const y = Math.floor(Math.random() * (canvasHeight / gridSize)) * gridSize;
    return { x, y };
  }, [canvasWidth, canvasHeight, gridSize]);

  // Bewegungs-Logik (Original-Zustand: 180° Wenden erlaubt/tödlich)
  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    setSnake(prevSnake => {
      const head = { x: prevSnake[0].x + direction.x, y: prevSnake[0].y + direction.y };

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
  }, [direction, food, gameOver, isPaused, createFood, canvasWidth, canvasHeight, gridSize]);

  // Game-Loop
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

  return { 
    snake, food, score, highscore, gameOver, 
    setDirection, gridSize, isPaused, setIsPaused, resetGame 
  };
}
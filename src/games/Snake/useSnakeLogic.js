import { useState, useEffect, useCallback } from 'react';
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
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [isPaused, setIsPaused] = useState(true);

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

  useEffect(() => {
    if (gameOver) {
      audioService.stopMusic();
      audioService.playFX('crash');
      scoreService.saveScore(score).then(wasNewRecord => {
        if (wasNewRecord) {
          setIsNewRecord(true);
          setHighscore(score);
        }
      });
    }
  }, [gameOver, score]);

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    setSnake((prevSnake) => {
      const head = { x: prevSnake[0].x + direction.x, y: prevSnake[0].y + direction.y };

      if (head.x < 0 || head.x >= canvasWidth || head.y < 0 || head.y >= canvasHeight) {
        setGameOver(true);
        return prevSnake;
      }
      if (prevSnake.some(p => p.x === head.x && p.y === head.y)) {
        setGameOver(true);
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

  useEffect(() => {
    const interval = setInterval(moveSnake, 100);
    return () => clearInterval(interval);
  }, [moveSnake]);

  return { 
    snake, food, score, highscore, gameOver, isNewRecord, 
    setDirection, gridSize, isPaused, setIsPaused 
  };
}
import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import SnakeGame from './games/Snake/SnakeGame';
import TetrisGame from './games/Tetris/TetrisGame'; 
import SpaceInvadersGame from './games/SpaceInvaders/SpaceInvadersGame';
import BreakoutGame from './games/Breakout/BreakoutGame';
import MainMenuView from './components/ui/MainMenuView';
import LoginView from './components/ui/LoginView';
import LeaderboardView from './components/ui/LeaderboardView';
import SettingsView from './components/ui/SettingsView';
import { audioService } from './services/audioService';
import { scoreService } from './services/scoreService';
import { useAppContext } from './context/AppContext';
import { SIDEBAR_ITEMS } from './menuConfig';
import './styles/effects.css';

function App() {
  const { user, currentView, navigate, sidebarIndex, setSidebarIndex } = useAppContext();

  // Erkennt automatisch welches Spiel beendet wurde
  const handleGameOver = async (finalScore: number, gameType: string) => {
    if (!user) {
      console.warn("ACCESS_DENIED: No agent identity for score sync.");
      navigate('leaderboard');
      return;
    }
    
    // Speichert den Score
    await scoreService.saveScore(user, finalScore, gameType);
    
    // Nach Speicherung zum Leaderboard wechseln
    navigate('leaderboard'); 
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Audio initialisieren, falls der User zuerst die Tastatur benutzt statt die Maus
      audioService.init();

      if (currentView === 'snake' || currentView === 'tetris' || currentView === 'spaceinvaders' || currentView === 'breakout' || currentView === 'login') return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSidebarIndex((prev) => (prev + 1) % SIDEBAR_ITEMS.length);
        audioService.playFX('select');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSidebarIndex((prev) => (prev - 1 + SIDEBAR_ITEMS.length) % SIDEBAR_ITEMS.length);
        audioService.playFX('select');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        navigate(SIDEBAR_ITEMS[sidebarIndex].id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, sidebarIndex, navigate, setSidebarIndex]);

  return (
    <div onMouseDown={() => audioService.init()} className="w-full h-screen bg-black p-2 md:p-6 overflow-hidden select-none font-vt323">
      <div className="w-full h-full crt-frame flex flex-col md:flex-row relative">
        <div className="crt-overlay" /><div className="crt-vignette" /><div className="scanline" />

        {user && (
          <Sidebar />
        )}

        <main className="flex-1 relative bg-black flex items-center justify-center z-10">
          {/* LOGIN NUR WENN KEIN USER DA IST */}
          {!user && currentView === 'login' && <LoginView />}
          
          {/* ALLE ANDEREN ANSICHTEN NUR FÜR EINGELOGGTE USER */}
          {user && (
            <>
              {currentView === 'menu' && <MainMenuView />}
              {currentView === 'snake' && <SnakeGame onGameOver={(score: number) => handleGameOver(score, 'snake')} />}
              {currentView === 'tetris' && <TetrisGame onGameOver={(score: number) => handleGameOver(score, 'tetris')} />}
              {currentView === 'spaceinvaders' && <SpaceInvadersGame onGameOver={(score: number) => handleGameOver(score, 'spaceinvaders')} />}
              {currentView === 'breakout' && <BreakoutGame onGameOver={(score: number) => handleGameOver(score, 'breakout')} />}
              {currentView === 'leaderboard' && <LeaderboardView />}
              {currentView === 'settings' && <SettingsView />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
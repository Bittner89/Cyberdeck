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
import { useIsMobile } from './hooks/useIsMobile';
import MobileControls from './components/ui/MobileControls';
import BottomNav from './components/layout/BottomNav';

function App() {
  const { user, currentView, navigate, sidebarIndex, setSidebarIndex } = useAppContext();
  const [isBooting, setIsBooting] = useState(true);
  const [bootLines, setBootLines] = useState<string[]>([]);

  const isMobile = useIsMobile();
  const isGameActive = ['snake', 'tetris', 'spaceinvaders', 'breakout'].includes(currentView);

  // FAKE BOOT SEQUENCE
  useEffect(() => {
    const lines = [
      "SYS_INIT: MEMORY CHECK OK (640K RAM)",
      "LOADING KERNEL MODULES...",
      "ESTABLISHING NEURAL LINK...",
      "DECRYPTING ICE PROTOCOLS...",
      "WARNING: UNAUTHORIZED ACCESS DETECTED",
      "BYPASSING SECURITY...",
      "ACCESS GRANTED. WELCOME TO NEXUS."
    ];
    let delay = 0;
    lines.forEach((line, index) => {
      delay += Math.random() * 300 + 150;
      setTimeout(() => {
        setBootLines(prev => [...prev, line]);
        if (index === lines.length - 1) setTimeout(() => setIsBooting(false), 1000);
      }, delay);
    });
  }, []);

  // Erkennt automatisch welches Spiel beendet wurde
  const handleGameOver = async (finalScore: number, gameType: string) => {
    if (!user) {
      console.warn("ACCESS_DENIED: No agent identity for score sync.");
      return;
    }
    
    // Speichert den Score
    await scoreService.saveScore(user, finalScore, gameType);
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
    <div onMouseDown={() => audioService.init()} className={`w-full bg-black overflow-hidden select-none font-vt323 flex flex-col ${isMobile ? 'h-[100dvh]' : 'p-6 h-screen'}`}>
      <div className={`w-full flex-1 min-h-0 flex relative ${isMobile ? 'flex-col overflow-hidden bg-black' : 'crt-frame flex-row'}`}>
        <div className="crt-overlay" /><div className="crt-vignette" /><div className="scanline" />

        {user && !isBooting && (!isMobile || !isGameActive) && (
          <Sidebar />
        )}

        <main className={`flex-1 relative bg-cyber-grid flex flex-col items-center justify-center z-10 overflow-hidden ${isMobile && !isGameActive ? 'pb-4' : ''}`}>
          {isBooting ? (
            <div className="w-full h-full p-10 font-vt323 text-neon-cyan flex flex-col justify-end pb-20">
              {bootLines.map((line, i) => (
                <div key={i} className="text-2xl md:text-3xl animate-fade-in opacity-80">{`> ${line}`}</div>
              ))}
              <div className="text-2xl md:text-3xl animate-pulse mt-2">{`> _`}</div>
            </div>
          ) : (
            <>
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
            </>
          )}
        </main>
      </div>

      {/* MOBILE CONTROLS (Wird nur auf dem Smartphone im Spiel angezeigt) */}
      {user && !isBooting && isMobile && isGameActive && (
        <MobileControls />
      )}

      {/* MOBILE BOTTOM NAV (Sichtbar in Menüs) */}
      {user && !isBooting && isMobile && !isGameActive && (
        <BottomNav />
      )}
    </div>
  );
}

export default App;
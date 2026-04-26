import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import SnakeGame from './games/Snake/SnakeGame';
import TetrisGame from './games/Tetris/TetrisGame'; 
import MainMenuView from './components/ui/MainMenuView';
import LoginView from './components/ui/LoginView';
import LeaderboardView from './components/ui/LeaderboardView';
import SettingsView from './components/ui/SettingsView';
import { audioService } from './services/audioService';
import { scoreService } from './services/scoreService';
import { authService } from './services/authService';
import './styles/effects.css';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('login');
  
  const [volume, setVolume] = useState((audioService.masterVolume || 0.12) * 100);
  const [isMuted, setIsMuted] = useState(audioService.isMuted);
  
  const menuOrder = ['menu', 'snake', 'tetris', 'leaderboard', 'settings'];
  const [sidebarIndex, setSidebarIndex] = useState(0);

  // User beim Start aus dem Speicher laden
  useEffect(() => {
    const savedUser = authService.getCurrentUser();
    if (savedUser) {
      setUser(savedUser.name);
      setCurrentView('menu');
      setSidebarIndex(0);
    }
  }, []);

  const handleLoginSuccess = (userName) => {
    setUser(userName);
    setCurrentView('menu');
    setSidebarIndex(0);
    audioService.playFX('confirm');
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setCurrentView('login');
  };

  // Erkennt automatisch welches Spiel beendet wurde
  const handleGameOver = async (finalScore) => {
    if (!user) {
      console.warn("ACCESS_DENIED: No agent identity for score sync.");
      setCurrentView('leaderboard');
      return;
    }
    
    // Speichert den Score basierend auf der aktuellen Ansicht
    const gameType = currentView; // 'snake' oder 'tetris'
    await scoreService.saveScore(user, finalScore, gameType);
    
    // Nach Speicherung zum Leaderboard wechseln
    setCurrentView('leaderboard'); 
    setSidebarIndex(menuOrder.indexOf('leaderboard'));
  };

  // Hilfsfunktion für den Wechsel aus dem Hauptmenü (inkl. Sidebar-Sync)
  const navigateFromMenu = (view) => {
    setCurrentView(view);
    const index = menuOrder.indexOf(view);
    if (index !== -1) setSidebarIndex(index);
    audioService.playFX('confirm');
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (currentView === 'snake' || currentView === 'tetris' || currentView === 'login') return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSidebarIndex((prev) => (prev + 1) % menuOrder.length);
        audioService.playFX('select');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSidebarIndex((prev) => (prev - 1 + menuOrder.length) % menuOrder.length);
        audioService.playFX('select');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const targetView = menuOrder[sidebarIndex];
        setCurrentView(targetView);
        audioService.playFX('confirm');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, sidebarIndex]);

  return (
    <div onMouseDown={() => audioService.init()} className="w-full h-screen bg-black p-2 md:p-6 overflow-hidden select-none font-vt323">
      <div className="w-full h-full crt-frame flex flex-col md:flex-row relative">
        <div className="crt-overlay" /><div className="crt-vignette" /><div className="scanline" />

        {user && (
          <Sidebar 
            currentView={currentView} 
            setCurrentView={(v) => { setCurrentView(v); setSidebarIndex(menuOrder.indexOf(v)); }} 
            activeIndex={sidebarIndex}
            user={user} 
            onLogout={handleLogout}
            volume={volume} 
            onVolumeChange={(e) => {
              const v = parseInt(e.target.value);
              setVolume(v);
              audioService.setMasterVolume(v / 100);
            }}
            isMuted={isMuted}
            onToggleMute={() => {
              const m = !isMuted;
              setIsMuted(m);
              audioService.setMuted(m);
            }}
          />
        )}

        <main className="flex-1 relative bg-black flex items-center justify-center z-10">
          {/* LOGIN NUR WENN KEIN USER DA IST */}
          {!user && currentView === 'login' && <LoginView onLoginSuccess={handleLoginSuccess} />}
          
          {/* ALLE ANDEREN ANSICHTEN NUR FÜR EINGELOGGTE USER */}
          {user && (
            <>
              {currentView === 'menu' && <MainMenuView user={user} onStartGame={navigateFromMenu} />}
              {currentView === 'snake' && <SnakeGame onExit={() => navigateFromMenu('menu')} onGameOver={handleGameOver} />}
              {currentView === 'tetris' && <TetrisGame onExit={() => navigateFromMenu('menu')} onGameOver={handleGameOver} />}
              {currentView === 'leaderboard' && <LeaderboardView user={user} onBack={() => navigateFromMenu('menu')} />}
              {currentView === 'settings' && <SettingsView volume={volume} isMuted={isMuted} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
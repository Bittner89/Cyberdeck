import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import SnakeGame from './games/Snake/SnakeGame';
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
  const [currentView, setCurrentView] = useState('login'); // Startet immer im Login
  
  const [volume, setVolume] = useState((audioService.masterVolume || 0.12) * 100);
  const [isMuted, setIsMuted] = useState(audioService.isMuted);
  
  const menuOrder = ['menu', 'snake', 'leaderboard', 'settings'];
  const [sidebarIndex, setSidebarIndex] = useState(0);
  const [dashboardIndex, setDashboardIndex] = useState(0);

  // Prüfen ob User bereits eingeloggt ist
  useEffect(() => {
    const savedUser = authService.getCurrentUser();
    if (savedUser) {
      setUser(savedUser.name);
      setCurrentView('menu');
    }
  }, []);

  const handleLoginSuccess = (userName) => {
    setUser(userName);
    setCurrentView('menu');
    audioService.playFX('confirm');
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setCurrentView('login');
  };

  const handleGameOver = async (finalScore) => {
    await scoreService.saveScore(user, finalScore);
    setCurrentView('leaderboard'); 
  };

  // ... (Keyboard-Handler bleibt gleich, nur Login-View Check einbauen)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (currentView === 'snake' || currentView === 'login') return;
      // ... Rest der Navigation wie gehabt
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
        setCurrentView(menuOrder[sidebarIndex]);
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

        {/* Sidebar nur anzeigen wenn User eingeloggt ist */}
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
          {currentView === 'login' && <LoginView onLoginSuccess={handleLoginSuccess} />}
          
          {user && (
            <>
              {currentView === 'menu' && <MainMenuView user={user} activeIndex={dashboardIndex} onStartGame={setCurrentView} />}
              {currentView === 'snake' && <SnakeGame onExit={() => setCurrentView('menu')} onGameOver={handleGameOver} />}
              {currentView === 'leaderboard' && <LeaderboardView user={user} onBack={() => setCurrentView('menu')} />}
              {currentView === 'settings' && <SettingsView volume={volume} isMuted={isMuted} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import SnakeGame from './games/Snake/SnakeGame';
import MainMenuView from './components/ui/MainMenuView';
import LoginView from './components/ui/LoginView';
import LeaderboardView from './components/ui/LeaderboardView';
import SettingsView from './components/ui/SettingsView';
import { audioService } from './services/audioService';
import './styles/effects.css';

function App() {
  const [currentView, setCurrentView] = useState('menu');
  const [user, setUser] = useState(null);
  
  // Audio State initialisiert aus dem Service (LocalStorage)
  const [volume, setVolume] = useState(audioService.masterVolume * 100);
  const [isMuted, setIsMuted] = useState(audioService.isMuted);
  
  const menuOrder = ['menu', 'snake', 'leaderboard', 'settings'];
  const [sidebarIndex, setSidebarIndex] = useState(0);
  const [dashboardIndex, setDashboardIndex] = useState(0);

  const [leaderboard] = useState([
    { name: "NEO", score: 2500 }, { name: "TRINITY", score: 2100 },
    { name: "MORPHEUS", score: 1950 }, { name: "SMITH", score: 1800 },
    { name: "ORACLE", score: 1500 }, { name: "NIOBE", score: 1200 },
    { name: "GHOST", score: 950 }, { name: "KEYMAKER", score: 800 },
    { name: "LINK", score: 650 }, { name: "TANK", score: 500 }
  ]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (currentView === 'snake') return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSidebarIndex((prev) => (prev + 1) % menuOrder.length);
        audioService.playFX('select');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSidebarIndex((prev) => (prev - 1 + menuOrder.length) % menuOrder.length);
        audioService.playFX('select');
      } else if (currentView === 'menu' && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        e.preventDefault();
        setDashboardIndex(prev => prev === 0 ? 1 : 0);
        audioService.playFX('select');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (currentView === 'menu' && dashboardIndex === 0) {
          setCurrentView('snake');
        } else {
          setCurrentView(menuOrder[sidebarIndex]);
        }
        audioService.playFX('confirm');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarIndex, dashboardIndex, currentView]);

  // Audio Handler
  const handleVolumeChange = (e) => {
    const v = parseInt(e.target.value);
    setVolume(v);
    audioService.setMasterVolume(v / 100);
  };

  const handleToggleMute = () => {
    const newMuteStatus = !isMuted;
    setIsMuted(newMuteStatus);
    audioService.setMuted(newMuteStatus);
  };

  return (
    <div onMouseDown={() => audioService.init()} className="w-full h-screen bg-black p-2 md:p-6 overflow-hidden select-none">
      <div className="w-full h-full crt-frame flex flex-col md:flex-row relative">
        <div className="crt-overlay" /><div className="crt-vignette" /><div className="scanline" />

        <Sidebar 
          currentView={currentView} 
          setCurrentView={(v) => { setCurrentView(v); setSidebarIndex(menuOrder.indexOf(v)); }} 
          activeIndex={sidebarIndex}
          user={user} 
          setUser={setUser} 
          volume={volume} 
          onVolumeChange={handleVolumeChange}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />

        <main className="flex-1 relative bg-black flex items-center justify-center z-10 overflow-auto">
          {currentView === 'menu' && (
            <MainMenuView 
              user={user} 
              activeIndex={dashboardIndex} 
              onStartGame={(id) => setCurrentView(id)} 
            />
          )}

          {currentView === 'snake' && <SnakeGame onExit={() => setCurrentView('menu')} />}
          {currentView === 'login' && <LoginView onLogin={(name) => { setUser(name); setCurrentView('menu'); }} />}
          {currentView === 'leaderboard' && <LeaderboardView data={leaderboard} onBack={() => setCurrentView('menu')} />}
          {currentView === 'settings' && (
            <SettingsView 
              volume={volume} 
              onVolumeChange={handleVolumeChange} 
              isMuted={isMuted} 
              onToggleMute={handleToggleMute} 
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
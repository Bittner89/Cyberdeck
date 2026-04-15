import React, { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import SnakeGame from './games/Snake/SnakeGame';
import LoginView from './components/ui/LoginView';
import RegisterView from './components/ui/RegisterView';
import LeaderboardView from './components/ui/LeaderboardView';
import SettingsView from './components/ui/SettingsView';
import { audioService } from './services/audioService';
import './styles/effects.css';

function App() {
  const [currentView, setCurrentView] = useState('menu');
  const [volume, setVolume] = useState(20);
  const [user, setUser] = useState(null);
  
  const [leaderboard] = useState([
    { name: "NEO", score: 1250 }, { name: "TRINITY", score: 1100 },
    { name: "MORPHEUS", score: 950 }, { name: "CYPHER", score: 400 },
  ]);

  const handleLogin = (username) => {
    setUser(username);
    setCurrentView('menu');
    audioService.playFX('confirm');
  };

  const handleVolumeChange = (e) => {
    const v = parseInt(e.target.value);
    setVolume(v);
    audioService.setMasterVolume(v / 100);
  };

  return (
    <div onMouseDown={() => audioService.init()} className="w-full h-screen bg-black p-2 md:p-6 overflow-hidden">
      <div className="w-full h-full crt-frame flex flex-col md:flex-row relative">
        <div className="crt-overlay" /><div className="crt-vignette" /><div className="scanline" />

        <Sidebar 
          currentView={currentView} setCurrentView={setCurrentView} 
          user={user} setUser={setUser} 
          volume={volume} onVolumeChange={handleVolumeChange} 
        />

        <main className="flex-1 relative bg-black flex items-center justify-center z-10 overflow-auto">
          {currentView === 'menu' && (
            <div className="flex-1 flex flex-col items-center justify-center font-vt323 text-neon-cyan text-center p-10">
              <h2 className="text-8xl opacity-10 mb-4 tracking-tighter select-none">NEXUS</h2>
              <div className="p-8 border border-neon-cyan/20 bg-neon-cyan/5 max-w-lg">
                <p className="text-xl mb-6 italic tracking-widest uppercase">System Ready</p>
                <button onClick={() => setCurrentView('snake')} className="w-full px-10 py-3 border-2 border-neon-cyan hover:bg-neon-cyan hover:text-black font-orbitron text-xs transition-all shadow-[0_0_10px_rgba(0,243,255,0.2)]">BOOT_SNAKE.EXE</button>
              </div>
            </div>
          )}

          {currentView === 'snake' && <SnakeGame onExit={() => setCurrentView('menu')} />}
          {currentView === 'login' && <LoginView onLogin={handleLogin} onSwitchToRegister={() => setCurrentView('register')} />}
          {currentView === 'register' && <RegisterView onBackToLogin={() => setCurrentView('login')} />}
          {currentView === 'leaderboard' && <LeaderboardView data={leaderboard} onBack={() => setCurrentView('menu')} />}
          {currentView === 'settings' && <SettingsView volume={volume} />}
        </main>
      </div>
    </div>
  );
}

export default App;
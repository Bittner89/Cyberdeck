import React from 'react';

export default function Sidebar({ 
  currentView, 
  setCurrentView, 
  activeIndex, 
  user, 
  onLogout, 
  volume, 
  onVolumeChange, 
  isMuted, 
  onToggleMute 
}) {
  const menuItems = [
    { id: 'menu', label: 'DASHBOARD', icon: '◰' },
    { id: 'snake', label: 'NEURAL_SNAKE', icon: 'S' },
    { id: 'leaderboard', label: 'HIGHSCORES', icon: '🏆' },
    { id: 'settings', label: 'SYSTEM_CFG', icon: 'C' },
  ];

  return (
    <aside className="w-full md:w-64 bg-black/80 border-r border-neon-cyan/30 flex flex-col z-20 font-vt323">
      {/* USER PROFILE SECTION */}
      <div className="p-4 border-b border-neon-cyan/20 bg-neon-cyan/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border border-neon-cyan flex items-center justify-center text-neon-cyan shadow-neon text-xl">
            {user ? user[0].toUpperCase() : '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-neon-cyan/50 uppercase tracking-tighter">Authorized_Agent</div>
            <div className="text-neon-cyan tracking-widest truncate uppercase">
              {user || 'GUEST_USER'}
            </div>
          </div>
        </div>

        {/* LOGOUT BUTTON - Zeigt sich nur wenn user eingeloggt ist */}
        {user && (
          <button 
            onClick={onLogout}
            className="mt-3 w-full border border-neon-pink/50 py-1 text-[10px] text-neon-pink hover:bg-neon-pink hover:text-black transition-all uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <span>[→]</span> DISCONNECT_SESSION
          </button>
        )}
        
        {!user && (
          <button 
            onClick={() => setCurrentView('login')}
            className="mt-3 w-full border border-neon-cyan/50 py-1 text-[10px] text-neon-cyan hover:bg-neon-cyan hover:text-black transition-all uppercase tracking-widest"
          >
            ESTABLISH_LINK
          </button>
        )}
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 py-4">
        {menuItems.map((item, index) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 transition-all duration-200 group
              ${activeIndex === index ? 'bg-neon-cyan/10 text-white' : 'text-neon-cyan/40 hover:text-neon-cyan/70'}`}
          >
            <span className="w-4 flex justify-center">{item.icon}</span>
            <span className="tracking-[0.2em] text-sm uppercase">{item.label}</span>
            {activeIndex === index && (
              <span className="ml-auto text-neon-cyan animate-pulse">▶</span>
            )}
          </button>
        ))}
      </nav>

      {/* AUDIO CONTROLS */}
      <div className="p-4 border-t border-neon-cyan/20 space-y-3 bg-black/40">
        <div className="flex justify-between text-[10px] text-neon-cyan/50 uppercase tracking-tighter">
          <span>Audio_Output</span>
          <span>{isMuted ? 'Muted' : `${Math.round(volume)}%`}</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleMute} 
            className={`transition-colors ${isMuted ? 'text-neon-pink' : 'text-neon-cyan hover:text-white'}`}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={isNaN(volume) ? 0 : volume} 
            onChange={onVolumeChange}
            className="flex-1 accent-neon-cyan bg-neon-cyan/20 h-1 appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* SYSTEM STATUS FOOTER */}
      <div className="p-2 text-[8px] text-neon-cyan/20 text-center uppercase tracking-[0.3em]">
        CyberDeck v3.0.4 // Local_Host
      </div>
    </aside>
  );
}
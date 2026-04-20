import React from 'react';

export default function Sidebar({ currentView, setCurrentView, activeIndex, user, setUser, volume, onVolumeChange, isMuted, onToggleMute }) {
  const menuItems = [
    { id: 'menu', label: 'DASHBOARD' },
    { id: 'snake', label: 'SNAKE_EXE' },
    { id: 'leaderboard', label: 'REGISTRY' },
    { id: 'settings', label: 'HARDWARE' }
  ];

  return (
    <aside className="w-full md:w-64 sidebar-border p-4 flex flex-col z-10 font-vt323 text-neon-cyan h-full">
      <div className="mb-8 border-b border-neon-cyan/30 pb-4">
        <h1 className="text-3xl italic font-black tracking-tighter text-glow">NEXUS_OS</h1>
        <div className="mt-2 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${user ? 'bg-green-500 animate-pulse' : 'bg-neon-pink animate-pulse'}`}></div>
          <span className="text-[10px] opacity-70 uppercase tracking-widest">
            {user ? `AUTH_LEVEL_01: ${user}` : "CONNECTION_RESTRICTED"}
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-3">
        {menuItems.map((item, index) => {
          const isFocused = index === activeIndex;
          const isActive = currentView === item.id;

          return (
            <button 
              key={item.id}
              onClick={() => setCurrentView(item.id)} 
              className={`w-full text-left p-3 transition-all relative flex items-center border
                ${isActive ? 'bg-neon-cyan text-black border-neon-cyan shadow-[0_0_15px_rgba(0,243,255,0.3)]' : 'border-transparent hover:bg-neon-cyan/5'}
                ${isFocused && !isActive ? 'border-white text-white translate-x-2' : ''}
              `}
            >
              {isFocused && (
                <span className={`mr-2 font-bold ${isActive ? 'text-black' : 'text-white'}`}>
                  {'>'}
                </span>
              )}
              <span className={`uppercase tracking-[0.1em] ${isFocused ? 'font-black' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4 pt-6 border-t border-neon-cyan/20">
        {!user ? (
          <button onClick={() => setCurrentView('login')} className="w-full py-2 border border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-black animate-pulse text-xs uppercase tracking-widest">Initialize_Login</button>
        ) : (
          <button onClick={() => setUser(null)} className="w-full py-2 border border-white/20 text-white/40 hover:bg-white hover:text-black text-xs uppercase transition-all tracking-widest">System_Logout</button>
        )}
        
        <div className="p-4 bg-neon-cyan/5 border border-neon-cyan/10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] opacity-50 uppercase tracking-widest">Audio: {isMuted ? 'MUTE' : `${volume}%`}</span>
            <button 
              onClick={onToggleMute}
              className={`text-[10px] px-2 py-0.5 border transition-colors ${isMuted ? 'border-neon-pink text-neon-pink animate-pulse' : 'border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black'}`}
            >
              {isMuted ? 'OFF' : 'ON'}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg w-4 text-center">{isMuted ? '×' : '♪'}</span>
            <input 
              type="range" min="0" max="100" 
              value={isMuted ? 0 : volume} 
              onChange={onVolumeChange}
              disabled={isMuted}
              className={`w-full accent-neon-cyan cursor-pointer transition-opacity ${isMuted ? 'opacity-20' : 'opacity-70 hover:opacity-100'}`} 
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
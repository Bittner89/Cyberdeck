import React from 'react';

export default function Sidebar({ currentView, setCurrentView, user, setUser, volume, onVolumeChange }) {
  const menuItems = [
    { id: 'menu', label: '[I] MAIN_MENU' },
    { id: 'snake', label: '[II] SNAKE_EXE' },
    { id: 'leaderboard', label: '[III] LEADERBOARD' },
    { id: 'settings', label: '[IV] SETTINGS' }
  ];

  return (
    <aside className="w-full md:w-64 sidebar-border p-4 flex flex-col z-10 font-vt323 text-neon-cyan h-full">
      <div className="mb-6 border-b border-neon-cyan pb-2">
        <h1 className="text-2xl italic font-black tracking-tighter">NEXUS_OS</h1>
        <p className="text-[10px] opacity-50 uppercase tracking-widest">
          STATUS: {user ? user : "GUEST_MODE"}
        </p>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map(item => (
          <button 
            key={item.id}
            onClick={() => setCurrentView(item.id)} 
            className={`w-full text-left p-2 transition-all ${currentView === item.id ? 'bg-neon-cyan text-black' : 'hover:bg-neon-cyan/10'}`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-4 pt-4 border-t border-neon-cyan/20">
        {!user ? (
          <button onClick={() => setCurrentView('login')} className="w-full py-2 border border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-black animate-pulse text-sm">LOGIN_REQUIRED</button>
        ) : (
          <button onClick={() => setUser(null)} className="w-full py-2 border border-white/30 text-white/50 hover:bg-white hover:text-black text-sm">LOGOUT</button>
        )}
        
        <div className="p-3 bg-neon-cyan/5 border border-neon-cyan/10">
          <div className="flex justify-between text-[10px] mb-1 opacity-70">
            <span>VOL_UNIT</span>
            <span>{volume}%</span>
          </div>
          <input type="range" min="0" max="100" value={volume} onChange={onVolumeChange} className="w-full accent-neon-cyan cursor-pointer" />
        </div>
      </div>
    </aside>
  );
}
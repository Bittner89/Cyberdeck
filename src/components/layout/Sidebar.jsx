import React from 'react';

const Sidebar = ({ currentView, setCurrentView, user, setUser, volume, onVolumeChange }) => {
  return (
    <div className="w-full md:w-64 sidebar-border p-4 flex flex-col z-10 font-vt323 text-neon-cyan h-full">
      {/* HEADER SECTION */}
      <div className="mb-6 border-b border-neon-cyan pb-2">
        <h1 className="text-2xl italic font-black tracking-tighter">NEXUS_OS</h1>
        <p className="text-[10px] opacity-50 uppercase tracking-[0.2em]">
          USER: {user ? user : "ANONYMOUS_GUEST"}
        </p>
      </div>

      {/* NAVIGATION SECTION */}
      <nav className="flex-1 space-y-2">
        <button 
          onClick={() => setCurrentView('menu')} 
          className={`w-full text-left p-2 transition-all ${currentView === 'menu' ? 'bg-neon-cyan text-black' : 'hover:bg-neon-cyan/10'}`}
        >
          [I] MAIN_MENU
        </button>
        <button 
          onClick={() => setCurrentView('snake')} 
          className={`w-full text-left p-2 transition-all ${currentView === 'snake' ? 'bg-neon-cyan text-black' : 'hover:bg-neon-cyan/10'}`}
        >
          [II] SNAKE_EXE
        </button>
        <button 
          onClick={() => setCurrentView('leaderboard')} 
          className={`w-full text-left p-2 transition-all ${currentView === 'leaderboard' ? 'bg-neon-cyan text-black' : 'hover:bg-neon-cyan/10'}`}
        >
          [III] LEADERBOARD
        </button>
        <button 
          onClick={() => setCurrentView('settings')} 
          className={`w-full text-left p-2 transition-all ${currentView === 'settings' ? 'bg-neon-cyan text-black' : 'hover:bg-neon-cyan/10'}`}
        >
          [IV] SETTINGS
        </button>
      </nav>

      {/* FOOTER SECTION (Login/Volume) */}
      <div className="mt-auto space-y-4 pt-4 border-t border-neon-cyan/20">
        {!user ? (
          <button 
            onClick={() => setCurrentView('login')}
            className="w-full py-2 border border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-black transition-all text-sm uppercase animate-pulse"
          >
            LOGIN_REQUIRED
          </button>
        ) : (
          <button 
            onClick={() => setUser(null)}
            className="w-full py-2 border border-white/50 text-white/50 hover:bg-white hover:text-black transition-all text-sm uppercase"
          >
            TERMINATE_SESSION
          </button>
        )}
        
        <div className="p-3 bg-neon-cyan/5 border border-neon-cyan/10 rounded-sm">
          <div className="flex justify-between text-[10px] mb-1 uppercase opacity-70">
            <span>Audio_Output</span>
            <span>{volume}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={volume} 
            onChange={onVolumeChange} 
            className="w-full accent-neon-cyan cursor-pointer opacity-80 hover:opacity-100" 
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
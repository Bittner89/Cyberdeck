import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { SIDEBAR_ITEMS } from '../../menuConfig';
import { useIsMobile } from '../../hooks/useIsMobile';

export default function Sidebar() {
  const { 
    user, logout, navigate, sidebarIndex,
    volume, changeVolume, isMuted, toggleMute 
  } = useAppContext();

  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  // --- MOBILE VERSION ---
  if (isMobile) {
    return (
      <aside className="w-full bg-black border-b border-neon-cyan/30 flex flex-col z-50 font-vt323 shrink-0 relative">
        <div className="flex justify-between items-center p-3 bg-neon-cyan/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-neon-cyan flex items-center justify-center text-neon-cyan shadow-neon text-lg">
              {user ? user[0].toUpperCase() : '?'}
            </div>
            <div className="text-neon-cyan tracking-widest uppercase">
              {user || 'GUEST'}
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="border border-neon-cyan text-neon-cyan px-3 py-1 chamfer-btn text-sm active:bg-neon-cyan active:text-black transition-colors"
          >
            {isOpen ? 'CLOSE_MENU' : 'SYS_MENU'}
          </button>
        </div>
        
        {isOpen && (
          <div className="flex flex-col bg-black/95 absolute top-full left-0 w-full border-b border-neon-cyan/30 shadow-neon-big overflow-y-auto max-h-[60vh] pb-4">
            <nav className="flex-1 py-2">
              {SIDEBAR_ITEMS.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => { navigate(item.id); setIsOpen(false); }}
                  className={`w-full flex items-center gap-4 px-4 py-3 transition-all duration-200
                    ${sidebarIndex === index ? 'bg-neon-cyan/10 text-white' : 'text-neon-cyan/40 active:text-neon-cyan/70'}`}
                >
                  <span className="w-4 flex justify-center">{item.icon}</span>
                  <span className="tracking-[0.2em] text-sm uppercase">{item.label}</span>
                </button>
              ))}
            </nav>
            
            {/* MOBILE LOGOUT */}
            <div className="px-4 mt-2">
              {user ? (
                <button onClick={() => { logout(); setIsOpen(false); }} className="w-full border border-neon-pink/50 py-2 text-xs text-neon-pink active:bg-neon-pink active:text-black transition-all uppercase tracking-widest">
                  DISCONNECT_SESSION
                </button>
              ) : (
                <button onClick={() => { navigate('login'); setIsOpen(false); }} className="w-full border border-neon-cyan/50 py-2 text-xs text-neon-cyan active:bg-neon-cyan active:text-black transition-all uppercase tracking-widest">
                  ESTABLISH_LINK
                </button>
              )}
            </div>
          </div>
        )}
      </aside>
    );
  }

  // --- DESKTOP VERSION ---
  return (
    <aside className="w-full md:w-64 bg-black/90 border-r border-neon-cyan/30 flex flex-col z-20 font-vt323 relative">
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
            onClick={logout}
            className="mt-3 w-full border border-neon-pink/50 py-1 text-[10px] text-neon-pink hover:bg-neon-pink hover:text-black transition-all uppercase tracking-widest flex items-center justify-center gap-2 chamfer-btn glitch-hover"
          >
            <span>[→]</span> DISCONNECT_SESSION
          </button>
        )}
        
        {!user && (
          <button 
            onClick={() => navigate('login')}
            className="mt-3 w-full border border-neon-cyan/50 py-1 text-[10px] text-neon-cyan hover:bg-neon-cyan hover:text-black transition-all uppercase tracking-widest chamfer-btn glitch-hover"
          >
            ESTABLISH_LINK
          </button>
        )}
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 py-4">
        {SIDEBAR_ITEMS.map((item, index) => (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 transition-all duration-200 group chamfer-btn glitch-hover mb-1
              ${sidebarIndex === index ? 'bg-neon-cyan/10 text-white' : 'text-neon-cyan/40 hover:text-neon-cyan/70'}`}
          >
            <span className="w-4 flex justify-center">{item.icon}</span>
            <span className="tracking-[0.2em] text-sm uppercase">{item.label}</span>
            {sidebarIndex === index && (
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
            onClick={toggleMute} 
            className={`transition-colors ${isMuted ? 'text-neon-pink' : 'text-neon-cyan hover:text-white'}`}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={isNaN(volume) ? 0 : volume} 
            onChange={(e) => changeVolume(parseInt(e.target.value))}
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
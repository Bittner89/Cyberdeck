import React, { useState, useEffect } from 'react';
import { audioService } from '../../services/audioService';
import { useAppContext } from '../../context/AppContext';
import { DASHBOARD_OPTIONS } from '../../menuConfig';

export default function MainMenuView() {
  const { user, navigate } = useAppContext();
  const [activeIndex, setActiveIndex] = useState(0);

  // Interne Navigation für das Dashboard
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        setActiveIndex(prev => (prev + 1) % DASHBOARD_OPTIONS.length);
        audioService.playFX('select');
      } else if (e.key === 'ArrowLeft') {
        setActiveIndex(prev => (prev - 1 + DASHBOARD_OPTIONS.length) % DASHBOARD_OPTIONS.length);
        audioService.playFX('select');
      } else if (e.key === 'Enter') {
        navigate(DASHBOARD_OPTIONS[activeIndex].id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, navigate]);

  return (
    <div className="w-full max-w-4xl animate-glitch-entry p-4 font-vt323">
      {/* WELCOME SECTION */}
      <div className="mb-12 border-l-4 border-neon-pink pl-8 py-2">
        <h1 className="text-6xl text-white tracking-tighter italic leading-none">
          WELCOME, <span className="text-neon-pink [text-shadow:_0_0_15px_rgba(255,0,255,0.8)] uppercase">AGENT_{user || 'UNKNOWN'}</span>
        </h1>
        <div className="flex items-center gap-2 mt-4">
          <span className="w-2 h-2 bg-neon-cyan animate-pulse"></span>
          <p className="text-neon-cyan/60 text-xl tracking-[0.3em] uppercase">
            System_Ready // Connection_Stable
          </p>
        </div>
      </div>

      {/* DASHBOARD OPTIONS - 3 Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {DASHBOARD_OPTIONS.map((opt, i) => (
          <div 
            key={opt.id}
            onClick={() => navigate(opt.id)}
            onMouseEnter={() => setActiveIndex(i)}
            className={`cursor-pointer p-6 border-2 transition-all duration-300 group relative flex flex-col justify-between h-64 ${
              activeIndex === i 
                ? 'border-neon-cyan bg-neon-cyan/5 -translate-y-2' 
                : 'border-neon-cyan/10 hover:border-neon-cyan/30 bg-transparent'
            }`}
          >
            {/* Active Indicator Line */}
            {activeIndex === i && (
              <div className="absolute left-0 right-0 top-0 h-1 bg-neon-cyan shadow-[0_0_15px_rgba(0,243,255,0.8)]"></div>
            )}

            <div className="flex justify-between items-start">
              <span className={`text-5xl ${activeIndex === i ? 'text-neon-cyan [text-shadow:_0_0_10px_rgba(0,243,255,0.5)]' : 'text-neon-cyan/20'}`}>
                {opt.icon}
              </span>
              {activeIndex === i && (
                <span className="text-neon-cyan animate-ping text-xs">●</span>
              )}
            </div>

            <div>
              <h3 className={`text-2xl mb-2 tracking-widest transition-colors ${
                activeIndex === i ? 'text-white' : 'text-neon-cyan/40'
              }`}>
                {opt.label}
              </h3>
              <p className="text-[12px] text-neon-cyan/40 leading-tight uppercase tracking-tighter">
                {opt.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* SYSTEM FOOTER */}
      <div className="mt-12 pt-4 border-t border-neon-cyan/10 flex justify-between items-center text-[10px] text-neon-cyan/20 uppercase tracking-[0.5em]">
        <span>Sector_01 // Neural_Link_Active</span>
        <span className="animate-pulse italic">Access_Level: Administrator</span>
      </div>
    </div>
  );
}
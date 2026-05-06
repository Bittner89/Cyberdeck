import React, { useState, useEffect, useRef } from 'react';
import { audioService } from '../../services/audioService';
import { useAppContext } from '../../context/AppContext';
import { DASHBOARD_OPTIONS } from '../../menuConfig';
import { useIsMobile } from '../../hooks/useIsMobile';

export default function MainMenuView() {
  const { user, navigate } = useAppContext();
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItemRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Interne Navigation für das Dashboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

  // Scrollt automatisch zum aktiven Spiel, wenn mit der Tastatur navigiert wird
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeIndex]);

  // --- MOBILE APP VERSION ---
  if (isMobile) {
    return (
      <div className="w-full h-full p-4 overflow-y-auto custom-scrollbar z-20 flex flex-col bg-transparent">
        {/* Native App Header */}
        <div className="mb-6 mt-4">
          <p className="text-neon-pink text-xs tracking-widest uppercase mb-1">Welcome_Agent</p>
          <h1 className="text-4xl text-white tracking-tighter uppercase italic">{user || 'UNKNOWN'}</h1>
          <div className="h-0.5 w-12 bg-neon-cyan mt-3"></div>
        </div>

        {/* App Cards List */}
        <div className="flex flex-col gap-4 pb-10">
          {DASHBOARD_OPTIONS.map((opt) => (
            <div 
              key={opt.id}
              onClick={() => navigate(opt.id)} 
              className="flex items-center bg-[#050a0a]/90 border border-neon-cyan/20 p-4 rounded-2xl active:scale-[0.98] transition-transform active:bg-neon-cyan/10 shadow-[0_4px_15px_rgba(0,0,0,0.5)]"
            >
              <div className="w-16 h-16 bg-black rounded-xl border border-neon-cyan/30 flex items-center justify-center text-4xl text-neon-cyan shadow-[inset_0_0_10px_rgba(0,243,255,0.2)] shrink-0">
                {opt.icon}
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-2xl text-white tracking-widest uppercase mb-1">{opt.label}</h3>
                <p className="text-xs text-neon-cyan/50 leading-tight">{opt.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- DESKTOP VERSION ---
  return (
    <div className="w-full lg:w-[1164px] lg:max-w-full max-w-4xl lg:h-[850px] max-h-full flex flex-col animate-glitch-entry p-4 md:p-8 font-vt323 bg-black/90 border-2 border-neon-cyan chamfer relative shadow-neon-big">
      {/* Decorative HUD Elements */}
      <div className="absolute top-2 left-2 text-[10px] text-neon-cyan/50">+</div>
      <div className="absolute top-2 right-2 text-[10px] text-neon-cyan/50">+</div>
      <div className="absolute bottom-2 left-2 text-[10px] text-neon-cyan/50">+</div>
      <div className="absolute bottom-2 right-2 text-[10px] text-neon-cyan/50">+</div>

      {/* WELCOME SECTION */}
      <div className="mb-6 md:mb-12 border-l-4 border-neon-pink pl-4 md:pl-8 py-2">
        <h1 className="text-4xl md:text-6xl text-white tracking-tighter italic leading-none">
          WELCOME, <span className="text-neon-pink [text-shadow:0_0_15px_rgba(255,0,255,0.8)] uppercase glitch-hover inline-block">AGENT_{user || 'UNKNOWN'}</span>
        </h1>
        <div className="flex items-center gap-2 mt-2 md:mt-4">
          <span className="w-2 h-2 bg-neon-cyan animate-pulse"></span>
          <p className="text-neon-cyan/60 text-sm md:text-xl tracking-widest md:tracking-[0.3em] uppercase">
            System_Ready // Connection_Stable
          </p>
        </div>
      </div>

      {/* Top Scroll Indicator & Navigation Hint */}
      <div className="flex justify-between text-neon-cyan/40 animate-pulse mb-2 text-[8px] md:text-[10px] tracking-[0.2em] md:tracking-[0.5em] uppercase">
        <span>[ USE ◄ / ► TO NAVIGATE ]</span>
        <span>▲ SCROLL_DATA ▲</span>
      </div>

      {/* DASHBOARD OPTIONS - Vertical List */}
      <div className="flex flex-col gap-4 overflow-y-auto flex-1 min-h-0 pr-2 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {DASHBOARD_OPTIONS.map((opt, i) => (
          <div 
            key={opt.id}
            ref={activeIndex === i ? activeItemRef : null}
            onClick={() => navigate(opt.id)}
            onMouseEnter={() => setActiveIndex(i)}
            className={`cursor-pointer p-4 border-2 transition-all duration-300 group relative flex flex-row items-center gap-6 chamfer-btn ${
              activeIndex === i 
                ? 'border-neon-cyan bg-neon-cyan/5 translate-x-2' 
                : 'border-neon-cyan/20 hover:border-neon-cyan/40 bg-black/50'
            }`}
          >
            {/* Active Indicator Line */}
            {activeIndex === i && (
              <div className="absolute left-0 bottom-0 top-0 w-1 bg-neon-cyan shadow-[0_0_15px_rgba(0,243,255,0.8)]"></div>
            )}

            {/* Logo/Icon (Links) */}
            <div className={`w-16 h-16 md:w-20 md:h-20 shrink-0 flex items-center justify-center border transition-all bg-black/80 ${activeIndex === i ? 'border-neon-cyan shadow-[0_0_10px_rgba(0,243,255,0.4)]' : 'border-neon-cyan/20'}`}>
              <span className={`text-4xl md:text-5xl transition-transform duration-300 ${activeIndex === i ? 'text-neon-cyan [text-shadow:0_0_15px_rgba(0,243,255,0.8)] scale-110' : 'text-neon-cyan/30 scale-100'}`}>
                {opt.icon}
              </span>
            </div>

            {/* Info Text (Mitte) */}
            <div className="flex-1 py-2">
              <div className="flex justify-between items-start mb-2">
                <h3 className={`text-xl md:text-3xl tracking-widest transition-colors glitch-hover ${
                  activeIndex === i ? 'text-white' : 'text-neon-cyan/60'
                }`}>
                  {opt.label}
                </h3>
                {activeIndex === i && (
                  <span className="text-neon-cyan animate-ping text-xs mr-4 hidden md:block">● LIVE</span>
                )}
              </div>
              <p className="text-xs md:text-base text-neon-cyan/50 leading-tight uppercase tracking-tighter">
                {opt.desc}
              </p>
              <div className={`mt-3 text-[10px] tracking-[0.3em] uppercase transition-opacity duration-300 ${activeIndex === i ? 'text-neon-pink opacity-100' : 'opacity-0'}`}>
                [PRESS ENTER TO LAUNCH]
              </div>
            </div>

            {/* Preview Image Container (Rechts) */}
            <div className={`hidden sm:flex w-32 h-24 md:w-48 md:h-32 shrink-0 items-center justify-center relative overflow-hidden border transition-all bg-black/80 ${activeIndex === i ? 'border-neon-cyan shadow-[0_0_10px_rgba(0,243,255,0.4)]' : 'border-neon-cyan/20'}`}>
              <div className="absolute inset-0 bg-cyber-grid opacity-30 z-10 pointer-events-none"></div>
              <div className="scanline opacity-50 z-10 pointer-events-none"></div>
              
              {/* Echter Screenshot */}
              <img 
                src={`/${opt.id}.png`} 
                alt={`${opt.label} Preview`} 
                className={`w-full h-full object-cover transition-all duration-300 ${activeIndex === i ? 'opacity-100 scale-105' : 'opacity-40 scale-100 grayscale'}`}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Scroll Indicator */}
      <div className="flex justify-end text-neon-cyan/40 animate-pulse mt-2 text-[8px] md:text-[10px] tracking-[0.2em] md:tracking-[0.5em] uppercase">
        <span>▼ SCROLL_DATA ▼</span>
      </div>

      {/* SYSTEM FOOTER */}
      <div className="mt-6 md:mt-12 pt-4 border-t border-neon-cyan/10 flex justify-between items-center text-[8px] md:text-[10px] text-neon-cyan/20 uppercase tracking-[0.2em] md:tracking-[0.5em] shrink-0">
        <span>Sector_01 // Neural_Link_Active</span>
        <span className="animate-pulse italic">Access_Level: Administrator</span>
      </div>
    </div>
  );
}
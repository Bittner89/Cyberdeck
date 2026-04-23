import React from 'react';

export default function MainMenuView({ user, activeIndex, onStartGame }) {
  const options = [
    { id: 'snake', label: 'NEURAL_SNAKE', desc: 'Hack into the grid. Collect data fragments.' },
    { id: 'leaderboard', label: 'GLOBAL_ARCHIVE', desc: 'See who currently dominates the net.' }
  ];

  return (
    <div className="w-full max-w-3xl animate-glitch-entry p-4 font-vt323">
      {/* WELCOME SECTION - CLEAN & OHNE HINTERGRUND-BOX */}
      <div className="mb-16 border-l-4 border-neon-pink pl-8 py-2">
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

      {/* DASHBOARD OPTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {options.map((opt, i) => (
          <div 
            key={opt.id}
            onClick={() => onStartGame(opt.id)}
            className={`cursor-pointer p-8 border-2 transition-all duration-300 group relative ${
              activeIndex === i 
                ? 'border-neon-cyan bg-transparent translate-x-2' 
                : 'border-neon-cyan/10 hover:border-neon-cyan/30 bg-transparent'
            }`}
          >
            {/* Aktiver Indikator Balken auf der linken Seite */}
            {activeIndex === i && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-neon-cyan shadow-[0_0_15px_rgba(0,243,255,0.8)]"></div>
            )}

            <div className="flex justify-between items-start mb-6">
              <span className={`text-4xl ${activeIndex === i ? 'text-neon-cyan [text-shadow:_0_0_10px_rgba(0,243,255,0.5)]' : 'text-neon-cyan/20'}`}>
                {i === 0 ? '▰' : '▱'}
              </span>
              {activeIndex === i && (
                <span className="text-neon-cyan animate-ping text-xs">●</span>
              )}
            </div>

            <h3 className={`text-3xl mb-3 tracking-widest transition-colors ${
              activeIndex === i ? 'text-white' : 'text-neon-cyan/40'
            }`}>
              {opt.label}
            </h3>
            
            <p className="text-sm text-neon-cyan/40 leading-relaxed uppercase tracking-tighter max-w-[200px]">
              {opt.desc}
            </p>
          </div>
        ))}
      </div>

      {/* SYSTEM DECORATION FOOTER */}
      <div className="mt-12 pt-4 border-t border-neon-cyan/10 flex justify-between items-center text-[10px] text-neon-cyan/20 uppercase tracking-[0.5em]">
        <span>Sector_01 // Neural_Link_Active</span>
        <span className="animate-pulse italic">Access_Level: Administrator</span>
      </div>
    </div>
  );
}
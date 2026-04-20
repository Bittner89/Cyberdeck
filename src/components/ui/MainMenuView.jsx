import React from 'react';

const GAMES = [
  {
    id: 'snake',
    title: 'SNAKE_EXE',
    description: 'Neural-Link Speed Test. Collect data fragments without terminal collision.',
    difficulty: 'LOW',
    status: 'STABLE'
  },
  {
    id: 'tetris',
    title: 'TETRIS_EXE',
    description: 'Structural Integrity Protocol. Optimize data blocks in real-time.',
    difficulty: 'MEDIUM',
    status: 'ENCRYPTED' // Zeigt an, dass es noch nicht spielbar ist
  }
];

export default function MainMenuView({ user, onStartGame, activeIndex }) {
  return (
    <div className="flex-1 flex flex-col p-10 font-vt323 text-neon-cyan max-w-5xl">
      {/* HEADER: Begrüßung */}
      <header className="mb-12 border-l-4 border-neon-cyan pl-6 animate-fade-in">
        <h2 className="text-xl opacity-50 tracking-[0.3em] uppercase">Dashboard_Home</h2>
        <h1 className="text-6xl text-glow uppercase italic">
          {user ? `Welcome_Back, ${user}` : "Access_Authorized: Guest"}
        </h1>
        <p className="mt-2 text-white/40 tracking-widest italic">
           System_Uptime: 99.9% | Connection: Secured_Neural_Link
        </p>
      </header>

      {/* GRID: Spiele-Übersicht */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {GAMES.map((game, index) => {
          const isFocused = activeIndex === index; // Für Tastatur-Nav
          const isLocked = game.status === 'ENCRYPTED';

          return (
            <div 
              key={game.id}
              onClick={() => !isLocked && onStartGame(game.id)}
              className={`
                relative p-6 border-2 transition-all cursor-pointer group
                ${isFocused ? 'border-white bg-white/10 scale-[1.02]' : 'border-neon-cyan/20 bg-black'}
                ${isLocked ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:border-neon-cyan hover:bg-neon-cyan/5'}
              `}
            >
              {/* Fokus-Indikator */}
              {isFocused && (
                <div className="absolute -top-2 -left-2 bg-white text-black px-2 py-0.5 text-xs font-bold animate-pulse">
                  ACTIVE_SELECTION
                </div>
              )}

              <div className="flex justify-between items-start mb-4">
                <h3 className="text-3xl tracking-tighter group-hover:text-glow">{game.title}</h3>
                <span className={`px-2 py-1 text-xs border ${game.status === 'STABLE' ? 'border-neon-cyan' : 'border-neon-pink'}`}>
                  {game.status}
                </span>
              </div>

              <p className="text-white/60 mb-6 h-12 italic leading-tight">
                {game.description}
              </p>

              <div className="flex justify-between items-end text-sm opacity-50 uppercase">
                <span>Diff: {game.difficulty}</span>
                <span>[ Press Enter ]</span>
              </div>

              {/* Dekorative Elemente */}
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-neon-cyan/30 group-hover:border-neon-cyan"></div>
            </div>
          );
        })}
      </div>

      {/* FOOTER: System Status */}
      <footer className="mt-auto pt-10 flex justify-between text-[10px] opacity-30 uppercase tracking-[0.2em]">
        <span>Hardware: Nexus_XL_800</span>
        <span>Environment: Production_Build_2026</span>
        <span>Region: Sector_G_North</span>
      </footer>
    </div>
  );
}
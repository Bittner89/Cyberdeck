import React from 'react';

export interface HighscoreEntry {
  id: string | number;
  username?: string;
  score: number;
}

interface GameSidebarProps {
  highscores: HighscoreEntry[];
  currentScore: number;
}

export default function GameSidebar({ highscores, currentScore }: GameSidebarProps) {
  return (
    <div className="w-72 shrink-0 font-vt323 text-neon-cyan border border-neon-cyan/20 bg-neon-cyan/5 p-4 flex flex-col overflow-hidden">
      <div className="shrink-0 mb-4 border-b border-neon-cyan/30 pb-2 flex justify-between items-end">
        <h3 className="text-2xl italic uppercase tracking-tighter shadow-neon">Top_10_Agents</h3>
        <span className="text-[10px] opacity-50 uppercase tracking-widest">Global_Net</span>
      </div>
      <div className="flex-1 space-y-1.5 overflow-y-auto min-h-0 custom-scrollbar pr-2">
        {highscores.map((entry, i) => (
          <div key={entry.id} className="flex items-center justify-between text-base py-1.5 px-2 border border-neon-cyan/10 bg-black/40 group hover:bg-neon-cyan/20 hover:border-neon-cyan/50 transition-all relative">
            {i === 0 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-neon-pink shadow-[0_0_10px_rgba(255,0,255,0.8)]" />}
            {i === 1 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-neon-cyan shadow-[0_0_10px_rgba(0,243,255,0.8)]" />}
            {i === 2 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-neon-green shadow-[0_0_10px_rgba(0,255,65,0.8)]" />}
            <div className="flex items-center gap-2 pl-1 w-full min-w-0">
              <span className={`w-4 text-center text-xs shrink-0 ${i === 0 ? 'text-neon-pink' : i === 1 ? 'text-neon-cyan' : i === 2 ? 'text-neon-green' : 'opacity-40'}`}>
                {i + 1}
              </span>
              <span className="tracking-widest truncate group-hover:text-white group-hover:translate-x-0.5 transition-all text-sm flex-1">
                {entry.username?.toUpperCase() || 'ANONYMOUS'}
              </span>
              <span className={`shrink-0 tabular-nums text-sm ${i === 0 ? 'text-neon-pink' : i === 1 ? 'text-neon-cyan' : i === 2 ? 'text-neon-green' : 'text-white'}`}>
                {entry.score.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* CURRENT SCORE DISPLAY */}
      <div className="shrink-0 mt-4 pt-4 border-t border-neon-cyan/30 text-right">
        <p className="text-sm opacity-50 uppercase tracking-widest mb-1">Current_Score</p>
        <p className="text-6xl text-neon-pink [text-shadow:0_0_15px_rgba(255,0,255,0.8)] tabular-nums leading-none">
          {currentScore}
        </p>
      </div>
    </div>
  );
}
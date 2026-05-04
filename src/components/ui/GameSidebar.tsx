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
    <div className="w-75 font-vt323 text-neon-cyan border border-neon-cyan/20 bg-neon-cyan/5 p-4 flex flex-col overflow-hidden">
      <h3 className="text-2xl border-b border-neon-cyan/30 pb-2 mb-4 italic uppercase tracking-tighter shadow-neon">Top_10_Agents</h3>
      <div className="flex-1 space-y-2">
        {highscores.map((entry, i) => (
          <div key={entry.id} className="flex items-center text-lg border-b border-neon-cyan/5 pb-1 group hover:bg-neon-cyan/10 px-1">
            <span className="opacity-40 inline-block w-10 shrink-0">#{String(i + 1).padStart(2, '0')}</span>
            <span className="flex-1 tracking-widest truncate mr-2 group-hover:text-white transition-colors">{entry.username?.toUpperCase() || 'ANONYMOUS'}</span>
            <span className="text-white shrink-0 tabular-nums">{entry.score}</span>
          </div>
        ))}
      </div>

      {/* CURRENT SCORE DISPLAY */}
      <div className="mt-4 pt-4 border-t border-neon-cyan/30 text-right">
        <p className="text-sm opacity-50 uppercase tracking-widest mb-1">Current_Score</p>
        <p className="text-6xl text-neon-pink [text-shadow:0_0_15px_rgba(255,0,255,0.8)] tabular-nums leading-none">
          {currentScore}
        </p>
      </div>
    </div>
  );
}
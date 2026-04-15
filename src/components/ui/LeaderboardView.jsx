// src/components/ui/LeaderboardView.jsx
import React from 'react';

export default function LeaderboardView({ data, onBack }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center font-vt323 text-neon-cyan p-10">
      <div className="w-full max-w-2xl p-8 border border-neon-cyan/20 bg-black/50">
        <h2 className="text-4xl mb-6 border-b border-neon-cyan/30 uppercase italic tracking-tighter text-glow">Global_Registry</h2>
        <div className="space-y-2">
          {data.map((entry, index) => (
            <div key={index} className="grid grid-cols-3 p-4 border-b border-neon-cyan/5 hover:bg-neon-cyan/5 transition-all group">
              <span className="text-xl opacity-50 group-hover:opacity-100">#0{index + 1}</span>
              <span className="text-xl tracking-widest">{entry.name}</span>
              <span className="text-xl text-right text-white text-glow">{entry.score}</span>
            </div>
          ))}
        </div>
        <button onClick={onBack} className="mt-8 px-6 py-2 border border-neon-cyan/50 text-[10px] uppercase hover:bg-neon-cyan/10">Back_to_Core</button>
      </div>
    </div>
  );
}
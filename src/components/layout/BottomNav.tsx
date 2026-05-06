import React from 'react';
import { useAppContext } from '../../context/AppContext';

export default function BottomNav() {
  const { currentView, navigate, user, logout } = useAppContext();
  
  if (!user) return null;

  const navItems = [
    { id: 'menu', label: 'DASH', icon: '◰' },
    { id: 'leaderboard', label: 'RANK', icon: '🏆' },
    { id: 'settings', label: 'SYS', icon: 'C' },
  ];

  return (
    <div className="flex shrink-0 w-full bg-black/90 backdrop-blur-md border-t border-neon-cyan/20 justify-around items-center p-2 pb-6 z-50">
      {navItems.map(item => {
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all duration-200 ${
              isActive ? 'text-neon-cyan bg-neon-cyan/10 scale-110 shadow-[inset_0_0_10px_rgba(0,243,255,0.2)]' : 'text-neon-cyan/40 active:scale-95'
            }`}
          >
            <span className="text-2xl leading-none mb-1">{item.icon}</span>
            <span className="text-[9px] tracking-widest uppercase">{item.label}</span>
          </button>
        );
      })}
      <button onClick={logout} className="flex flex-col items-center justify-center w-16 h-12 rounded-xl text-neon-pink/40 active:scale-95 transition-all">
        <span className="text-2xl leading-none mb-1">[→]</span>
        <span className="text-[9px] tracking-widest uppercase">EXIT</span>
      </button>
    </div>
  );
}
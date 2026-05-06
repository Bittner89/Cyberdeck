import React, { useCallback } from 'react';

export default function MobileControls() {
  const trigger = useCallback((key: string, type: 'keydown' | 'keyup') => {
    // Haptisches Feedback (Vibration) auf unterstützten Geräten
    if (type === 'keydown' && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15); // 15 Millisekunden: Fühlt sich an wie ein echter, mechanischer Klick
    }
    window.dispatchEvent(new KeyboardEvent(type, { key, bubbles: true }));
  }, []);

  // e.preventDefault() wurde entfernt. 
  // Das CSS (touch-action: none) verhindert das Scrollen ohnehin!
  const bind = (key: string) => ({
    onPointerDown: () => trigger(key, 'keydown'),
    onPointerUp: () => trigger(key, 'keyup'),
    onPointerCancel: () => trigger(key, 'keyup'),
    onPointerLeave: () => trigger(key, 'keyup'),
  });

  return (
    <div className="flex shrink-0 justify-between items-end w-full bg-[#010303] border-t-2 border-neon-cyan/20 p-6 z-50 pb-8 shadow-[0_-10px_30px_rgba(0,243,255,0.05)] select-none touch-none relative overflow-hidden">
      
      {/* Dekorative HUD Linie oben */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-neon-cyan/30 rounded-b-full"></div>

      {/* Steuerkreuz (D-Pad) */}
      <div className="grid grid-cols-3 grid-rows-3 gap-1 w-40 h-40 relative">
        <div className="absolute inset-0 bg-neon-cyan/5 rounded-full blur-xl pointer-events-none"></div>
        
        <div className="col-start-2 row-start-1">
          <button {...bind('ArrowUp')} className="w-full h-full rounded-t-2xl bg-black border-t border-l border-r border-neon-cyan/50 text-neon-cyan flex justify-center items-center text-2xl active:bg-neon-cyan/30 active:shadow-[0_0_20px_rgba(0,243,255,0.6)] transition-colors">▲</button>
        </div>
        <div className="col-start-1 row-start-2">
          <button {...bind('ArrowLeft')} className="w-full h-full rounded-l-2xl bg-black border-l border-t border-b border-neon-cyan/50 text-neon-cyan flex justify-center items-center text-2xl active:bg-neon-cyan/30 active:shadow-[0_0_20px_rgba(0,243,255,0.6)] transition-colors">◄</button>
        </div>
        <div className="col-start-2 row-start-2 bg-neon-cyan/10 rounded-sm">
          {/* Zentrum des Steuerkreuzes (kein Button) */}
        </div>
        <div className="col-start-3 row-start-2">
          <button {...bind('ArrowRight')} className="w-full h-full rounded-r-2xl bg-black border-r border-t border-b border-neon-cyan/50 text-neon-cyan flex justify-center items-center text-2xl active:bg-neon-cyan/30 active:shadow-[0_0_20px_rgba(0,243,255,0.6)] transition-colors">►</button>
        </div>
        <div className="col-start-2 row-start-3">
          <button {...bind('ArrowDown')} className="w-full h-full rounded-b-2xl bg-black border-b border-l border-r border-neon-cyan/50 text-neon-cyan flex justify-center items-center text-2xl active:bg-neon-cyan/30 active:shadow-[0_0_20px_rgba(0,243,255,0.6)] transition-colors">▼</button>
        </div>
      </div>

      {/* Aktions-Tasten */}
      <div className="flex flex-col items-end justify-between h-40">
        <div className="flex gap-2">
          <button {...bind('Escape')} className="px-3 py-2 bg-black border border-neon-cyan/40 text-neon-cyan/70 text-[10px] uppercase tracking-widest rounded active:bg-neon-cyan/30 active:text-white transition-all">SYS_ESC</button>
          <button {...bind('Enter')} className="px-3 py-2 bg-black border border-neon-cyan/40 text-neon-cyan/70 text-[10px] uppercase tracking-widest rounded active:bg-neon-cyan/30 active:text-white transition-all">SYS_ENT</button>
        </div>
        <button {...bind(' ')} className="w-24 h-24 rounded-full bg-black border-2 border-neon-pink text-neon-pink font-bold text-3xl flex justify-center items-center shadow-[0_0_20px_rgba(255,0,255,0.3)] active:bg-neon-pink/30 active:shadow-[0_0_40px_rgba(255,0,255,0.8)] active:scale-95 transition-all">ACT</button>
      </div>
    </div>
  );
}

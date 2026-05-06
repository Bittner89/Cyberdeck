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
    <div className="flex shrink-0 justify-between items-center w-full bg-[#030808] border-t border-neon-cyan/30 p-4 z-50 pb-6 shadow-[0_-5px_20px_rgba(0,243,255,0.1)] select-none touch-none">
      {/* Steuerkreuz (D-Pad) */}
      <div className="grid grid-cols-3 grid-rows-3 gap-2 w-40 h-40">
        <div />
        <button {...bind('ArrowUp')} className="bg-neon-cyan/10 border border-neon-cyan active:bg-neon-cyan/50 flex justify-center items-center text-neon-cyan text-3xl rounded-lg shadow-[inset_0_0_10px_rgba(0,243,255,0.2)]">▲</button>
        <div />
        <button {...bind('ArrowLeft')} className="bg-neon-cyan/10 border border-neon-cyan active:bg-neon-cyan/50 flex justify-center items-center text-neon-cyan text-3xl rounded-lg shadow-[inset_0_0_10px_rgba(0,243,255,0.2)]">◄</button>
        <button {...bind('ArrowDown')} className="bg-neon-cyan/10 border border-neon-cyan active:bg-neon-cyan/50 flex justify-center items-center text-neon-cyan text-3xl rounded-lg shadow-[inset_0_0_10px_rgba(0,243,255,0.2)]">▼</button>
        <button {...bind('ArrowRight')} className="bg-neon-cyan/10 border border-neon-cyan active:bg-neon-cyan/50 flex justify-center items-center text-neon-cyan text-3xl rounded-lg shadow-[inset_0_0_10px_rgba(0,243,255,0.2)]">►</button>
      </div>

      {/* Aktions-Tasten */}
      <div className="flex flex-col gap-4 items-center">
        <div className="flex gap-3">
          <button {...bind('Escape')} className="px-4 py-2 bg-neon-cyan/10 border border-neon-cyan text-neon-cyan text-sm active:bg-neon-cyan/50 rounded uppercase font-bold tracking-widest">Esc</button>
          <button {...bind('Enter')} className="px-4 py-2 bg-neon-cyan/10 border border-neon-cyan text-neon-cyan text-sm active:bg-neon-cyan/50 rounded uppercase font-bold tracking-widest">Ent</button>
        </div>
        <button {...bind(' ')} className="w-20 h-20 rounded-full bg-neon-pink/10 border-2 border-neon-pink active:bg-neon-pink/40 text-neon-pink font-bold text-xl flex justify-center items-center shadow-[0_0_20px_rgba(255,0,255,0.3)] tracking-widest">ACT</button>
      </div>
    </div>
  );
}

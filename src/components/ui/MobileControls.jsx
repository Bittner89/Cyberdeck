import React from 'react';

export default function MobileControls() {
  // Diese Funktion simuliert einen Tastendruck
  const sendKey = (keyName) => {
    const event = new KeyboardEvent('keydown', { key: keyName });
    window.dispatchEvent(event);
  };

  return (
    <div className="fixed bottom-6 left-0 right-0 flex flex-col items-center gap-2 md:hidden z-[100]">
      {/* Oben */}
      <button 
        onPointerDown={() => sendKey('ArrowUp')}
        className="w-16 h-16 bg-neon-cyan/10 border-2 border-neon-cyan/50 text-neon-cyan rounded-full flex items-center justify-center text-2xl active:scale-90 active:bg-neon-cyan/40 transition-all"
      >▲</button>
      
      {/* Mitte (Links / Rechts) */}
      <div className="flex gap-16">
        <button 
          onPointerDown={() => sendKey('ArrowLeft')}
          className="w-16 h-16 bg-neon-cyan/10 border-2 border-neon-cyan/50 text-neon-cyan rounded-full flex items-center justify-center text-2xl active:scale-90 active:bg-neon-cyan/40 transition-all"
        >◀</button>
        <button 
          onPointerDown={() => sendKey('ArrowRight')}
          className="w-16 h-16 bg-neon-cyan/10 border-2 border-neon-cyan/50 text-neon-cyan rounded-full flex items-center justify-center text-2xl active:scale-90 active:bg-neon-cyan/40 transition-all"
        >▶</button>
      </div>

      {/* Unten */}
      <button 
        onPointerDown={() => sendKey('ArrowDown')}
        className="w-16 h-16 bg-neon-cyan/10 border-2 border-neon-cyan/50 text-neon-cyan rounded-full flex items-center justify-center text-2xl active:scale-90 active:bg-neon-cyan/40 transition-all"
      >▼</button>
    </div>
  );
}
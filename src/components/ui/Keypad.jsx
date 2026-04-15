import React from 'react';

export default function Keypad() {
  return (
    <div className="cyber-keypad">
      {/* Obere Funktions-Tasten */}
      <div className="function-keys">
        <div className="btn-cyber btn-large">BOOT</div>
        <div className="btn-nav flex justify-center items-center text-xl">⏻</div>
        <div className="btn-cyber btn-large">||</div>
      </div>

      {/* Das Num-Pad / Steuerkreuz */}
      <div className="num-pad">
        <div className="btn-num">▲</div>
        <div className="btn-num">▲</div>
        <div className="btn-num">3</div>
        <div className="btn-num">◀</div>
        <div className="btn-num text-neon-pink">●</div>
        <div className="btn-num">▶</div>
        <div className="btn-num">7</div>
        <div className="btn-num">▼</div>
        <div className="btn-num">9</div>
        <div className="btn-num">*</div>
        <div className="btn-num">0</div>
        <div className="btn-num">#</div>
      </div>

      <div className="mt-4 text-neon-cyan/50 text-[10px] text-center font-mono tracking-[0.2em]">
        WASD // SPACE // ENTER
      </div>
    </div>
  );
}
import React from 'react';
import { useMouseTilt } from '../../hooks/useMouseTilt';
import '../../styles/cyberdeck.css';
import '../../styles/effects.css';

export default function Cyberdeck({ children, isMobile }) {
  // Der 3D-Effekt wird nur berechnet, wenn wir NICHT auf dem Handy sind
  const tiltStyle = useMouseTilt();

  return (
    /* Auf Mobile deaktivieren wir den 3D-Effekt (transform: none) */
    <div className="deck-container" style={{ transform: isMobile ? 'none' : tiltStyle }}>
      
      <div className="cyberdeck-body">
        {/* Dekorative Elemente (werden via CSS auf Mobile versteckt) */}
        <div className="tech-lines"></div>
        <div className="screw tl"></div>
        <div className="screw tr"></div>
        <div className="screw bl"></div>
        <div className="screw br"></div>
        
        <div className="brand-logo text-center">NEXUS-7</div>
        <div className="speaker mt-4"></div>

        {/* Der Bildschirm-Rahmen */}
        <div className="screen-bezel">
          <div className="screen-label">
            <span>VISUAL OUTPUT // REC</span>
            <span className="animate-pulse-fast text-neon-cyan">00:00</span>
          </div>

          {/* Der Display-Bereich */}
          <div className="cyber-display" id="displayContainer">
            <div className="crt-overlay"></div>
            <div className="glass-overlay"></div>
            
            {/* Hier wird das Spiel (Snake) angezeigt */}
            {children}
          </div>
        </div>

        {/* Die physischen Tasten (nur auf Desktop sichtbar) */}
        {!isMobile && (
          <div className="cyber-keypad">
             <div className="function-keys flex justify-between w-full px-4 mb-4">
                <div className="btn-cyber btn-large px-2">BOOT</div>
                <div className="btn-nav w-12 h-12 flex items-center justify-center rounded-full">⏻</div>
                <div className="btn-cyber btn-large px-2">ESC</div>
             </div>
             {/* Kleiner Hinweis für Desktop-User */}
             <div className="text-[10px] opacity-40 font-mono uppercase tracking-widest text-center">
               Keyboard Control Active
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
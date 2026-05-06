import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { useIsMobile } from '../../hooks/useIsMobile';

export default function SettingsView() {
  const { volume, isMuted, changeVolume, toggleMute } = useAppContext();
  const isMobile = useIsMobile();

  // --- MOBILE APP VERSION ---
  if (isMobile) {
    return (
      <div className="w-full h-full flex flex-col z-20 bg-transparent p-4 overflow-y-auto custom-scrollbar">
        <h2 className="text-3xl text-neon-cyan tracking-tighter uppercase italic mb-6 mt-2">SYS_CONFIG</h2>
        
        <div className="bg-[#050a0a] border border-neon-cyan/20 rounded-2xl p-5 mb-4 shadow-[0_4px_15px_rgba(0,0,0,0.5)]">
          <div className="flex justify-between items-center mb-6">
            <span className="text-lg text-neon-cyan/80 uppercase">Volume</span>
            <span className="text-2xl text-white">{isMuted ? 'MUTE' : `${volume}%`}</span>
          </div>
          
          <input 
            type="range" min="0" max="100" value={volume} 
            onChange={(e) => changeVolume(parseInt(e.target.value))} 
            disabled={isMuted}
            className={`w-full accent-neon-cyan h-3 rounded-full cursor-pointer mb-6 ${isMuted ? 'opacity-20' : 'opacity-100'}`}
          />

          <button 
            onClick={toggleMute}
            className={`w-full py-4 rounded-xl text-lg font-bold uppercase transition-colors active:scale-95 ${isMuted ? 'bg-neon-pink text-black' : 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan'}`}
          >
            {isMuted ? 'UNMUTE AUDIO' : 'MUTE AUDIO'}
          </button>
        </div>
      </div>
    );
  }

  // --- DESKTOP VERSION ---

  return (
    <div className="w-full lg:w-[1164px] lg:max-w-full max-w-2xl lg:h-[850px] max-h-full flex flex-col items-center p-4 md:p-10 bg-black/90 border-2 border-neon-cyan shadow-neon-big font-vt323 text-neon-cyan animate-fade-in chamfer relative">
      <div className="absolute top-2 left-2 text-neon-cyan/50 text-[10px]">CFG-SYS</div>
      <div className="absolute bottom-2 right-2 text-neon-cyan/50 text-[10px]">V-3.0</div>

      <div className="w-full max-w-2xl flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-4">
      <header className="mb-10 border-b border-neon-cyan/30 pb-4 shrink-0">
        <h2 className="text-5xl italic uppercase text-glow">Hardware_Settings</h2>
        <p className="text-xs opacity-50 tracking-[0.3em] mt-2"> CORE_VOLTAGE_ADJUSTMENT</p>
      </header>
      
      <div className="space-y-12">
        {/* AUDIO SECTION */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-xl opacity-50 tracking-widest uppercase">01_Audio_Output</h3>
            <span className="text-4xl text-white">
              {isMuted ? 'OFF' : `${volume}%`}
            </span>
          </div>

          <div className="flex flex-col gap-8 p-8 border border-neon-cyan/20 bg-neon-cyan/5 relative overflow-hidden">
            {/* Hintergrund Deko */}
            <div className="absolute top-0 right-0 p-2 opacity-10 text-[8px] font-mono leading-none text-right">
              SIG_STRENGTH: 100%<br/>DRIVER: REALTEK_NX
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs mb-1 uppercase opacity-70">
                <span>Gain_Control</span>
                <span>{isMuted ? 'DISCONNECTED' : 'STABLE'}</span>
              </div>
              <input 
                type="range" 
                min="0" max="100" 
                value={volume} 
              onChange={(e) => changeVolume(parseInt(e.target.value))} 
                disabled={isMuted}
                className={`w-full accent-neon-cyan h-2 cursor-pointer transition-opacity ${isMuted ? 'opacity-20' : 'opacity-100'}`}
              />
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-neon-cyan/10">
              <div className="flex flex-col">
                <span className="text-sm uppercase tracking-tighter">Silence_Protocol</span>
                <span className="text-[10px] opacity-40 italic">Mutes all system frequencies</span>
              </div>
              <button 
              onClick={toggleMute}
                className={`px-8 py-2 border-2 font-bold transition-all ${isMuted 
                  ? 'bg-neon-pink text-black border-neon-pink shadow-[0_0_15px_rgba(255,0,255,0.4)]' 
                  : 'border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black'}`}
              >
                {isMuted ? 'DEACTIVATE_MUTE' : 'ACTIVATE_MUTE'}
              </button>
            </div>
          </div>
        </section>

        {/* SYSTEM INFO */}
        <section className="opacity-30 italic text-xs space-y-1 font-mono">
          <p> CONFIGURATION_PATH: LOCAL_STORAGE://NEXUS/SETTINGS.JSON</p>
          <p> CHANGES_COMMITTED_AUTOMATICALLY: TRUE</p>
          <p> ENCRYPTION_LAYER: ACTIVE</p>
        </section>
      </div>
      </div>
    </div>
  );
}
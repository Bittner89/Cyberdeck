import React from 'react';

export default function SettingsView({ volume }) {
  return (
    <div className="flex-1 flex flex-center justify-center items-center font-vt323 text-neon-cyan p-10">
      <div className="w-full max-w-md p-8 border border-neon-cyan/20 bg-neon-cyan/5">
        <h2 className="text-3xl mb-4 border-b border-neon-cyan/30 uppercase text-glow">Hardware_Config</h2>
        <p className="mb-4 opacity-80">Current Calibration: {volume}% Gain</p>
        <div className="space-y-2 text-xs opacity-40 italic font-mono uppercase">
          <p> Emulation_Mode: CRT_ULTRA_SCAN</p>
          <p> Frequency_Range: 20Hz - 22kHz</p>
          <p> Signal_Status: Clean</p>
        </div>
      </div>
    </div>
  );
}
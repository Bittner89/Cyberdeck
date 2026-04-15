// src/components/ui/RegisterView.jsx
import React from 'react';

export default function RegisterView({ onBackToLogin }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center font-vt323 text-neon-cyan">
      <div className="w-full max-w-sm p-8 border border-neon-pink/20 bg-neon-pink/5">
        <h2 className="text-3xl mb-6 border-b border-neon-pink/30 uppercase italic text-neon-pink text-glow-pink">Create_ID</h2>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onBackToLogin(); }}>
          <input type="text" placeholder="CHOOSE_NAME" className="w-full bg-black border border-neon-pink/30 p-2 text-neon-pink focus:outline-none focus:border-neon-pink" required />
          <input type="email" placeholder="NEURAL_LINK (EMAIL)" className="w-full bg-black border border-neon-pink/30 p-2 text-neon-pink focus:outline-none focus:border-neon-pink" required />
          <input type="password" placeholder="NEW_PASSKEY" className="w-full bg-black border border-neon-pink/30 p-2 text-neon-pink focus:outline-none focus:border-neon-pink" required />
          <button type="submit" className="w-full py-3 bg-neon-pink text-black font-bold uppercase hover:bg-white transition-colors shadow-[0_0_15px_rgba(255,0,255,0.3)]">Establish ID</button>
          <button onClick={onBackToLogin} className="w-full py-2 text-[10px] uppercase opacity-50 hover:opacity-100">Abort_Sequence</button>
        </form>
      </div>
    </div>
  );
}
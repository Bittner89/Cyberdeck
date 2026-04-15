// src/components/ui/LoginView.jsx
import React from 'react';

export default function LoginView({ onLogin, onSwitchToRegister }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center font-vt323 text-neon-cyan">
      <div className="w-full max-w-sm p-8 border border-neon-cyan/20 bg-neon-cyan/5">
        <h2 className="text-3xl mb-6 border-b border-neon-cyan/30 uppercase italic text-glow">User_Login</h2>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onLogin("Agent_Smith"); }}>
          <input type="text" placeholder="AGENT_ID" className="w-full bg-black border border-neon-cyan/30 p-2 text-neon-cyan focus:outline-none focus:border-neon-cyan" required />
          <input type="password" placeholder="PASSKEY" className="w-full bg-black border border-neon-cyan/30 p-2 text-neon-cyan focus:outline-none focus:border-neon-cyan" required />
          <button type="submit" className="w-full py-3 bg-neon-cyan text-black font-bold uppercase hover:bg-white transition-colors shadow-[0_0_15px_rgba(0,243,255,0.3)]">Authorize</button>
          <p className="text-[10px] text-center opacity-50 cursor-pointer hover:underline" onClick={onSwitchToRegister}>Request_New_ID</p>
        </form>
      </div>
    </div>
  );
}
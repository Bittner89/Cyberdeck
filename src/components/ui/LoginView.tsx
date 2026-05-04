import React, { useState } from 'react';
import { authService } from '../../services/authService';
import type { UserData } from '../../services/authService';
import { useAppContext } from '../../context/AppContext';

export default function LoginView() {
  const { login } = useAppContext();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // Validierung
    const isValidEmail = (mail: string) => /\S+@\S+\.\S+/.test(mail);
    if (!email || !isValidEmail(email)) {
      setErrorMsg("INVALID_DATA_PACKET: Valid Email required.");
      return;
    }

    if (mode === 'register') {
      if (!username || username.length < 3) {
        setErrorMsg("INVALID_IDENTITY: Agent Name must be at least 3 chars.");
        return;
      }
      if (password.length < 6) { // Supabase braucht min. 6
        setErrorMsg("SECURITY_BREACH: Password too short (min 6).");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg("ERROR: Password mismatch.");
        return;
      }
    }

    setLoading(true);

    try {
      let userData: UserData;
      if (mode === "register") {
        // WICHTIG: Email, Passwort UND Username übergeben
        userData = await authService.register(email, password, username);
        setSuccessMsg("IDENTITY_CREATED: Welcome Agent " + username.toUpperCase());
        setTimeout(() => login(userData.name), 1500);
      } else if (mode === "login") {
        // WICHTIG: Hier fehlte das password!
        userData = await authService.login(email, password);
        login(userData.name);
      }
    } catch (err) {
      // Fehlermeldung vom Server anzeigen
      setErrorMsg((err as Error).message.toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-black border-2 border-neon-cyan shadow-neon-big animate-glitch-entry font-vt323 relative z-20">
      <div className="text-center mb-10">
        <h2 className="text-4xl text-neon-cyan mb-2 tracking-[0.3em] shadow-neon uppercase">
          {mode === "login" ? "ESTABLISH_LINK" : "GENERATE_ID"}
        </h2>
        <div className="h-0.5 w-full bg-neon-cyan/20"></div>
      </div>

      <div className={`transition-all duration-300 ${errorMsg || successMsg ? 'mb-6 opacity-100' : 'h-0 opacity-0 overflow-hidden'}`}>
        {errorMsg && <div className="p-3 bg-neon-pink/10 border border-neon-pink text-neon-pink text-xs animate-pulse">[!] {errorMsg}</div>}
        {successMsg && <div className="p-3 bg-neon-cyan/10 border border-neon-cyan text-neon-cyan text-xs">[✓] {successMsg}</div>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-neon-cyan/50 text-[10px] uppercase tracking-widest ml-1">Agent_Email</label>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full bg-neon-cyan/5 border-b border-neon-cyan/30 p-2 text-xl text-white outline-none focus:border-neon-cyan transition-all"
            placeholder="name@grid.net"
          />
        </div>

        {mode === "register" && (
          <div className="space-y-1 animate-fade-in">
            <label className="text-neon-cyan/50 text-[10px] uppercase tracking-widest ml-1">Choose_Agent_Name</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              className="w-full bg-neon-cyan/5 border-b border-neon-cyan/30 p-2 text-xl text-white outline-none focus:border-neon-pink transition-all uppercase"
              placeholder="e.g. JOKER"
            />
          </div>
        )}

        <div className="space-y-1">
          <label className="text-neon-cyan/50 text-[10px] uppercase tracking-widest ml-1">Access_Code</label>
          <input
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="w-full bg-neon-cyan/5 border-b border-neon-cyan/30 p-2 text-xl text-white outline-none focus:border-neon-pink transition-all"
            placeholder="********"
          />
        </div>

        {mode === "register" && (
          <div className="space-y-1 animate-fade-in">
            <label className="text-neon-pink/50 text-[10px] uppercase tracking-widest ml-1">Confirm_Code</label>
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              className="w-full bg-neon-cyan/5 border-b border-neon-pink/30 p-2 text-xl text-white outline-none focus:border-neon-pink transition-all"
              placeholder="********"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 mt-4 border-2 transition-all duration-300 text-xl tracking-[0.4em] uppercase 
            ${loading ? 'border-gray-600 text-gray-600' : 'border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black shadow-neon-hover'}`}
        >
          {loading ? "PROCESSING..." : mode === "login" ? "INITIALIZE" : "FINALIZE"}
        </button>
      </form>

      <div className="mt-8 flex flex-col items-center gap-3 border-t border-neon-cyan/10 pt-6">
        <button 
          onClick={() => { setMode(mode === "login" ? "register" : "login"); setErrorMsg(""); }}
          className="text-neon-pink/60 hover:text-neon-pink text-[10px] uppercase tracking-[0.2em]"
        >
          {mode === "login" ? "> Create New Agent Identity" : "> Return to Login Portal"}
        </button>
      </div>
    </div>
  );
}
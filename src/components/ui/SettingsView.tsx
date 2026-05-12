import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';

export default function SettingsView() {
  const { user, navigate, volume, changeVolume, isMuted, toggleMute, logout } = useAppContext();
  const [activeTab, setActiveTab] = useState('account');

  // Dummy-States für das Account-Formular
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // States für Feedback & Loading
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{text: string, type: 'error' | 'success' | null}>({ text: '', type: null });
  
  // States für Account-Löschung
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<{text: string, type: 'error' | 'success' | null}>({ text: '', type: null });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Dummy-States für Visual Settings
  const [crtEnabled, setCrtEnabled] = useState(true);
  const [glitchLevel, setGlitchLevel] = useState('high');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg({ text: '', type: null });

    if (newPassword !== confirmPassword) {
      setStatusMsg({ text: 'ERROR: NEW_KEYS_DO_NOT_MATCH', type: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      setStatusMsg({ text: 'ERROR: KEY_TOO_WEAK (MIN 6 CHARACTERS)', type: 'error' });
      return;
    }

    setIsUpdating(true);
    setStatusMsg({ text: 'TRANSMITTING_NEW_KEY...', type: 'success' }); // Simuliert einen Info-Status

    try {
      // Supabase Update Aufruf (OldPassword wird von Supabase standardmäßig nicht zwingend benötigt, 
      // es sei denn du hast "Secure password change" in deinem Supabase Dashboard aktiviert)
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) throw error;

      setStatusMsg({ text: 'SUCCESS: ENCRYPTION_KEY_UPDATED', type: 'success' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setStatusMsg({ text: `ERROR: ${error.message.toUpperCase()}`, type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const executeDelete = async () => {
    setIsDeleting(true);
    setShowDeleteConfirm(false);
    setDeleteStatus({ text: 'EXECUTING_PURGE_PROTOCOL...', type: 'error' });

    try {
      // Wir rufen eine eigene Datenbank-Funktion (RPC) in Supabase auf
      const { error } = await supabase.rpc('delete_user');
      if (error) throw error;

      setDeleteStatus({ text: 'IDENTITY_ERASED. DISCONNECTING...', type: 'success' });
      
      setTimeout(() => {
        logout();
      }, 1500);
    } catch (error: any) {
      setDeleteStatus({ text: `PURGE_FAILED: ${error.message.toUpperCase()}`, type: 'error' });
      setIsDeleting(false);
    }
  };

  return (
    <>
    {/* CYBERPUNK CONFIRMATION MODAL */}
    {showDeleteConfirm && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-glitch-entry font-vt323">
        <div className="bg-[#030707] border-2 border-neon-pink shadow-[0_0_30px_rgba(255,0,255,0.4)] p-6 md:p-8 max-w-lg w-full rounded-xl relative">
          <div className="absolute top-2 left-2 text-[10px] text-neon-pink/50">+</div>
          <div className="absolute bottom-2 right-2 text-[10px] text-neon-pink/50">+</div>
          <h2 className="text-2xl md:text-3xl text-neon-pink tracking-widest uppercase mb-4 flex items-center gap-3">
            <span className="animate-pulse">⚠</span> SYSTEM_WARNING
          </h2>
          <p className="text-white/70 text-lg md:text-xl tracking-wider mb-8">
            You are about to permanently format your neural identity. All scores, records, and access privileges will be purged. This action is <span className="text-neon-pink underline">irreversible</span>.
          </p>
          <div className="flex flex-col md:flex-row gap-4">
            <button 
              onClick={executeDelete}
              className="flex-1 py-3 bg-neon-pink/10 border border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-black transition-all uppercase tracking-[0.2em] font-bold shadow-[inset_0_0_15px_rgba(255,0,255,0.2)]"
            >
              [ CONFIRM_PURGE ]
            </button>
            <button 
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 py-3 border border-neon-cyan/30 text-neon-cyan/70 hover:text-neon-cyan hover:border-neon-cyan hover:bg-neon-cyan/10 transition-all uppercase tracking-[0.2em]"
            >
              CANCEL_OPERATION
            </button>
          </div>
        </div>
      </div>
    )}

    <div className="w-full lg:w-[1164px] lg:max-w-full max-w-4xl lg:h-[850px] max-h-full flex flex-col animate-glitch-entry font-vt323 p-6 md:p-10 bg-[#030707]/80 border border-neon-cyan/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-20 backdrop-blur-md rounded-xl">
      <div className="absolute top-2 left-2 text-[10px] text-neon-cyan/50">+</div>
      <div className="absolute bottom-2 right-2 text-[10px] text-neon-cyan/50">+</div>

      {/* HEADER & TABS */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8 border-b border-white/10 pb-6 shrink-0">
        <div>
          <h2 className="text-3xl md:text-4xl text-white tracking-[0.2em] uppercase font-light drop-shadow-[0_0_12px_rgba(0,243,255,0.4)] mb-3">
            System_Config
          </h2>
          <div className="flex gap-6 text-xs md:text-sm tracking-[0.3em] overflow-x-auto custom-scrollbar pb-1">
            <button onClick={() => setActiveTab('account')} className={`transition-all duration-300 ${activeTab === 'account' ? 'text-neon-cyan drop-shadow-[0_0_5px_rgba(0,243,255,0.8)]' : 'text-neon-cyan/40 hover:text-neon-cyan/80'}`}>[ SECURITY ]</button>
            <button onClick={() => setActiveTab('audio')} className={`transition-all duration-300 ${activeTab === 'audio' ? 'text-neon-cyan drop-shadow-[0_0_5px_rgba(0,243,255,0.8)]' : 'text-neon-cyan/40 hover:text-neon-cyan/80'}`}>[ AUDIO ]</button>
            <button onClick={() => setActiveTab('visuals')} className={`transition-all duration-300 ${activeTab === 'visuals' ? 'text-neon-cyan drop-shadow-[0_0_5px_rgba(0,243,255,0.8)]' : 'text-neon-cyan/40 hover:text-neon-cyan/80'}`}>[ DISPLAY ]</button>
          </div>
        </div>
        <button onClick={() => navigate('menu')} className="text-neon-cyan/40 hover:text-neon-pink transition-colors text-sm tracking-[0.2em] uppercase">
          &lt; EXIT_NODE
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
        
        {/* --- SECURITY / ACCOUNT TAB --- */}
        {activeTab === 'account' && (
          <div className="space-y-8 animate-glitch-entry">
            {!user ? (
              <div className="text-center py-20 text-neon-pink/50 text-xl tracking-widest border border-white/5 bg-white/5 rounded-lg">
                ACCESS_DENIED: AGENT_NOT_AUTHENTICATED
              </div>
            ) : (
              <>
                <section className="space-y-4">
                  <h3 className="text-xl text-neon-cyan tracking-[0.2em] border-b border-neon-cyan/20 pb-2">Modify_Encryption_Key (Password)</h3>
                  <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                    <div className="space-y-1">
                      <label className="text-xs text-white/50 tracking-widest uppercase">Current_Key</label>
                      <input 
                        type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 focus:border-neon-cyan p-2 text-white outline-none transition-colors tracking-widest font-sans"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-white/50 tracking-widest uppercase">New_Key</label>
                      <input 
                        type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 focus:border-neon-cyan p-2 text-white outline-none transition-colors tracking-widest font-sans"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-white/50 tracking-widest uppercase">Confirm_New_Key</label>
                      <input 
                        type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 focus:border-neon-cyan p-2 text-white outline-none transition-colors tracking-widest font-sans"
                        placeholder="••••••••"
                      />
                    </div>
                    
                    {statusMsg.text && (
                      <div className={`p-2 mt-2 text-xs tracking-[0.1em] border animate-pulse ${
                        statusMsg.type === 'error' ? 'bg-neon-pink/10 border-neon-pink text-neon-pink' : 'bg-neon-cyan/10 border-neon-cyan text-neon-cyan'
                      }`}>
                        {statusMsg.text}
                      </div>
                    )}

                    <button type="submit" disabled={isUpdating} className={`mt-2 px-6 py-2 border transition-colors uppercase tracking-[0.2em] text-sm ${
                      isUpdating ? 'border-neon-cyan/50 text-neon-cyan/50 cursor-not-allowed' : 'border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10'
                    }`}>
                      {isUpdating ? 'Executing...' : 'Execute_Key_Override'}
                    </button>
                  </form>
                </section>

                <section className="space-y-4 pt-6 mt-6 border-t border-white/5">
                  <h3 className="text-xl text-neon-pink tracking-[0.2em] border-b border-neon-pink/20 pb-2">Danger_Zone</h3>
                  <p className="text-white/40 text-sm tracking-wider">Warning: Formatting your neural identity is irreversible. All scores and data will be permanently purged from the mainframe.</p>
                  
                  {deleteStatus.text && (
                    <div className={`p-2 text-xs tracking-[0.1em] border animate-pulse ${
                      deleteStatus.type === 'error' ? 'bg-neon-pink/10 border-neon-pink text-neon-pink' : 'bg-neon-cyan/10 border-neon-cyan text-neon-cyan'
                    }`}>
                      {deleteStatus.text}
                    </div>
                  )}

                  <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isDeleting}
                    className={`px-6 py-2 border transition-colors uppercase tracking-[0.2em] text-sm flex items-center gap-2 ${
                      isDeleting ? 'border-neon-pink/30 text-neon-pink/50 cursor-not-allowed' : 'border-neon-pink/50 text-neon-pink hover:bg-neon-pink/10'
                    }`}
                  >
                    <span className="text-lg leading-none animate-pulse">⚠</span> 
                    {isDeleting ? 'Erasing...' : 'Erase_Neural_Identity'}
                  </button>
                </section>
              </>
            )}
          </div>
        )}

        {/* --- AUDIO TAB --- */}
        {activeTab === 'audio' && (
          <div className="space-y-8 animate-glitch-entry max-w-xl">
            <section className="space-y-6">
              <h3 className="text-xl text-neon-cyan tracking-[0.2em] border-b border-neon-cyan/20 pb-2">Sensory_Output_Levels</h3>
              
              {/* Master Volume */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm tracking-widest text-white/70 uppercase">
                  <span>Master_Volume</span>
                  <span>{isMuted ? 'MUTED' : `${Math.round(volume)}%`}</span>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={toggleMute} className={`text-xl ${isMuted ? 'text-neon-pink' : 'text-neon-cyan'}`}>
                    {isMuted ? '🔇' : '🔊'}
                  </button>
                  <input 
                    type="range" min="0" max="100" 
                    value={isNaN(volume) ? 0 : volume} 
                    onChange={(e) => changeVolume(parseInt(e.target.value))}
                    className="flex-1 accent-neon-cyan bg-white/10 h-1 appearance-none cursor-pointer rounded-full"
                  />
                </div>
              </div>
            </section>
          </div>
        )}

        {/* --- DISPLAY / VISUALS TAB --- */}
        {activeTab === 'visuals' && (
          <div className="space-y-8 animate-glitch-entry max-w-xl">
            <section className="space-y-6">
              <h3 className="text-xl text-neon-cyan tracking-[0.2em] border-b border-neon-cyan/20 pb-2">Holographic_Interface</h3>
              
              <div className="flex items-center justify-between p-4 border border-white/5 bg-white/5 rounded-lg">
                <div className="space-y-1">
                  <div className="text-white tracking-widest uppercase">CRT_Scanlines</div>
                  <div className="text-xs text-white/40 tracking-wider">Simulate retro terminal hardware artifacts</div>
                </div>
                <button 
                  onClick={() => setCrtEnabled(!crtEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${crtEnabled ? 'bg-neon-cyan/20' : 'bg-black/50 border border-white/10'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${crtEnabled ? 'bg-neon-cyan left-7 shadow-[0_0_10px_rgba(0,243,255,0.8)]' : 'bg-white/30 left-1'}`}></div>
                </button>
              </div>

              <div className="space-y-3 p-4 border border-white/5 bg-white/5 rounded-lg">
                <div className="space-y-1 mb-4">
                  <div className="text-white tracking-widest uppercase">Glitch_Intensity</div>
                  <div className="text-xs text-white/40 tracking-wider">Configure visual distortion amount during navigation</div>
                </div>
                <div className="flex gap-2">
                  {['off', 'low', 'high'].map(level => (
                    <button 
                      key={level}
                      onClick={() => setGlitchLevel(level)}
                      className={`flex-1 py-2 text-xs uppercase tracking-widest transition-all ${glitchLevel === level ? 'bg-neon-cyan/10 border-b-2 border-neon-cyan text-neon-cyan' : 'text-white/40 hover:text-white border-b-2 border-transparent hover:bg-white/5'}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* DECORATION FOOTER */}
      <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-[10px] text-white/20 uppercase tracking-[0.3em] shrink-0 px-4">
        <span>Settings_Module v1.2</span>
        <span>Status: Online</span>
      </div>
    </div>
    </>
  );
}

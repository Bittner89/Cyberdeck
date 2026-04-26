import React, { useState, useEffect } from 'react';
import { scoreService } from '../../services/scoreService';

export default function LeaderboardView({ onBack, user }) {
  const [activeTab, setActiveTab] = useState('global'); 
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let data = [];
        if (activeTab === 'global') {
          // Holt die Top 10 aller Spieler (Standard: Snake)
          data = await scoreService.getHighscores('snake');
        } else {
          // Holt nur die Scores des aktuell eingeloggten Users
          data = await scoreService.getMyHighscores(user, 'snake');
        }
        setScores(data);
      } catch (err) {
        console.error("Failed to fetch leaderboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab, user]);

  return (
    <div className="w-full max-w-4xl animate-glitch-entry font-vt323 p-6 bg-black border-2 border-neon-cyan shadow-neon-big relative z-20">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 border-b-2 border-neon-cyan pb-4">
        <h2 className="text-4xl text-neon-cyan tracking-tighter uppercase italic">
          {activeTab === 'global' ? '::Global_Leaderboard::' : '::Personal_Archive::'}
        </h2>
        <button 
          onClick={onBack} 
          className="text-neon-pink hover:bg-neon-pink hover:text-black border border-neon-pink px-6 py-1 transition-all"
        >
          BACK_TO_MENU
        </button>
      </div>

      {/* TABS */}
      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setActiveTab('global')}
          className={`flex-1 py-2 border-2 transition-all duration-300 ${activeTab === 'global' ? 'bg-neon-cyan text-black border-neon-cyan shadow-neon' : 'text-neon-cyan border-neon-cyan/30 hover:border-neon-cyan'}`}
        >
          GLOBAL_NET_SCORES
        </button>
        <button 
          onClick={() => setActiveTab('personal')}
          className={`flex-1 py-2 border-2 transition-all duration-300 ${activeTab === 'personal' ? 'bg-neon-pink text-black border-neon-pink shadow-neon-pink' : 'text-neon-pink border-neon-pink/30 hover:border-neon-pink'}`}
        >
          PERSONAL_RECORDS ({user || 'GHOST'})
        </button>
      </div>

      {/* LISTE */}
      <div className="grid grid-cols-1 gap-2 overflow-y-auto max-h-[50vh] pr-4 custom-scrollbar min-h-[300px]">
        {loading ? (
          <div className="text-center py-20 text-neon-cyan animate-pulse text-2xl uppercase tracking-[0.5em]">
            Accessing_Database...
          </div>
        ) : scores.length > 0 ? (
          scores.map((entry, i) => (
            <div key={entry.id} className="flex items-center justify-between p-3 bg-neon-cyan/5 border border-neon-cyan/20 hover:bg-neon-cyan/10 transition-colors group">
              <div className="flex items-center gap-6">
                <span className={`text-2xl w-8 ${i < 3 ? 'text-neon-pink' : 'opacity-30'}`}>#{i + 1}</span>
                <span className="text-xl tracking-widest group-hover:text-neon-cyan transition-colors">
                  {entry.username ? entry.username.toUpperCase() : 'ANONYMOUS'}
                </span>
              </div>
              <div className="flex items-center gap-12">
                <span className="text-neon-cyan/40 text-sm hidden md:block uppercase">
                  {entry.created_at ? new Date(entry.created_at).toLocaleDateString() : 'N/A'}
                </span>
                <span className="text-2xl text-white shadow-neon w-24 text-right">
                  {entry.score.toLocaleString()}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 text-neon-pink/50 text-2xl italic border border-neon-pink/20 bg-neon-pink/5">
            {activeTab === 'personal' && !user 
              ? 'ACCESS_DENIED: LOGIN_REQUIRED_FOR_PERSONAL_DATA' 
              : 'NO_DATA_FOUND_IN_THIS_SECTOR'}
          </div>
        )}
      </div>

      {/* DECORATION */}
      <div className="mt-6 flex justify-between text-[10px] text-neon-cyan/30 uppercase tracking-[0.2em]">
        <span>Encryption: AES-256</span>
        <span>Source: Neural_Link_Cloud</span>
      </div>
    </div>
  );
}
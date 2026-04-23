import React, { useState, useEffect } from 'react';
import { scoreService } from '../../services/scoreService';

export default function LeaderboardView({ onBack, user }) {
  const [activeTab, setActiveTab] = useState('global'); // 'global' oder 'personal'
  const [scores, setScores] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (activeTab === 'global') {
        // Zeige alles von allen
        const data = await scoreService.getHighscores();
        setScores(data);
      } else {
        // Zeige nur Einträge für den aktuellen User
        const data = await scoreService.getMyHighscores(user);
        setScores(data);
      }
    };
    fetchData();
  }, [activeTab, user]);

  return (
    <div className="w-full max-w-4xl animate-glitch-entry font-vt323 p-6 bg-black border-2 border-neon-cyan shadow-neon-big">
      <div className="flex justify-between items-center mb-8 border-b-2 border-neon-cyan pb-4">
        <h2 className="text-4xl text-neon-cyan tracking-tighter uppercase italic">
          {activeTab === 'global' ? '::Global_Leaderboard::' : '::Personal_Archive::'}
        </h2>
        <button onClick={onBack} className="text-neon-pink hover:text-white border border-neon-pink px-4 py-1">BACK_TO_MENU</button>
      </div>

      {/* TABS ZUM UMSCHALTEN */}
      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setActiveTab('global')}
          className={`flex-1 py-2 border-2 transition-all ${activeTab === 'global' ? 'bg-neon-cyan text-black border-neon-cyan' : 'text-neon-cyan border-neon-cyan/30 hover:border-neon-cyan'}`}
        >
          GLOBAL_NET_SCORES
        </button>
        <button 
          onClick={() => setActiveTab('personal')}
          className={`flex-1 py-2 border-2 transition-all ${activeTab === 'personal' ? 'bg-neon-pink text-black border-neon-pink' : 'text-neon-pink border-neon-pink/30 hover:border-neon-pink'}`}
        >
          PERSONAL_RECORDS ({user || 'GHOST'})
        </button>
      </div>

      {/* DIE LISTE */}
      <div className="grid grid-cols-1 gap-2 overflow-y-auto max-h-[50vh] pr-4 custom-scrollbar">
        {scores.length > 0 ? (
          scores.map((entry, i) => (
            <div key={entry.id} className="flex items-center justify-between p-3 bg-neon-cyan/5 border border-neon-cyan/20 hover:bg-neon-cyan/10 transition-colors">
              <div className="flex items-center gap-6">
                <span className="text-2xl opacity-30 w-8">#{i + 1}</span>
                <span className="text-xl tracking-widest">{entry.username.toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-12">
                <span className="text-neon-cyan opacity-40 text-sm">{new Date(entry.date).toLocaleDateString()}</span>
                <span className="text-2xl text-white shadow-neon">{entry.score.toLocaleString()}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 text-neon-pink opacity-50 text-2xl italic">
            {activeTab === 'personal' && !user 
              ? 'ACCESS_DENIED: LOGIN_REQUIRED_FOR_PERSONAL_DATA' 
              : 'NO_DATA_FOUND_IN_THIS_SECTOR'}
          </div>
        )}
      </div>
    </div>
  );
}
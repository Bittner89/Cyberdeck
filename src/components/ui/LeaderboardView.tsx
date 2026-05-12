import React, { useState, useEffect } from 'react';
import { scoreService, ScoreEntry } from '../../services/scoreService';
import { useAppContext } from '../../context/AppContext';
import { useIsMobile } from '../../hooks/useIsMobile';

export default function LeaderboardView() {
  const { user, navigate } = useAppContext();
  const [activeTab, setActiveTab] = useState('global'); 
  const [activeGame, setActiveGame] = useState('snake');
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userRank, setUserRank] = useState<number | null>(null);
  
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let data = [];
        if (activeTab === 'global') {
          // Holt ALLE einzigartigen Top-Scores für das Spiel
          const allUniqueData = await scoreService.getHighscores(activeGame, 0);
          
          if (user) {
            const rankIndex = allUniqueData.findIndex(e => e.username?.toUpperCase() === user.toUpperCase());
            setUserRank(rankIndex !== -1 ? rankIndex + 1 : null);
          }

          // Für die globale Liste zeigen wir nur die Top 100 an
          data = allUniqueData.slice(0, 100);
        } else {
          if (!user) {
            setScores([]);
            return;
          }
          // Holt nur die Scores des eingeloggten Users für das Spiel
          data = await scoreService.getMyHighscores(user, activeGame);
          setUserRank(null);
        }
        setScores(data);
      } catch (err) {
        console.error("Failed to fetch leaderboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab, user, activeGame]);

  const scrollToMyRank = () => {
    if (!user) return;
    const row = document.getElementById(`rank-row-${user.toUpperCase()}`);
    if (row) {
      row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // --- MOBILE APP VERSION ---
  if (isMobile) {
    return (
      <div className="w-full h-full flex flex-col z-20 bg-transparent p-4">
        <h2 className="text-3xl text-neon-cyan tracking-tighter uppercase italic mb-4 mt-2">
          {activeTab === 'global' ? 'Global_Rankings' : 'My_Archives'}
        </h2>

        {/* Game Select Horizontal Scroll */}
        <div className="flex overflow-x-auto gap-2 pb-2 mb-2 custom-scrollbar shrink-0">
          {['snake', 'tetris', 'spaceinvaders', 'breakout'].map(game => (
            <button 
              key={game} onClick={() => setActiveGame(game)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap transition-colors text-sm uppercase ${activeGame === game ? 'bg-neon-cyan text-black font-bold shadow-[0_0_10px_rgba(0,243,255,0.5)]' : 'bg-[#050a0a] text-neon-cyan/50 border border-neon-cyan/20'}`}
            >
              {game}
            </button>
          ))}
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-4 shrink-0 bg-[#050a0a] p-1 rounded-xl border border-neon-cyan/20">
          <button onClick={() => setActiveTab('global')} className={`flex-1 py-2 rounded-lg text-sm transition-colors ${activeTab === 'global' ? 'bg-neon-cyan text-black' : 'text-neon-cyan/60'}`}>GLOBAL</button>
          <button onClick={() => setActiveTab('personal')} className={`flex-1 py-2 rounded-lg text-sm transition-colors ${activeTab === 'personal' ? 'bg-neon-pink text-black' : 'text-neon-pink/60'}`}>PERSONAL</button>
        </div>

        {/* Score List */}
        <div className="flex flex-col gap-2 overflow-y-auto flex-1 min-h-0 pb-10 custom-scrollbar">
          {loading ? (
            <div className="text-center py-10 text-neon-cyan animate-pulse">Syncing...</div>
          ) : scores.length > 0 ? (
            scores.map((entry, i) => (
              <div 
                key={entry.id} id={`rank-row-${entry.username?.toUpperCase()}`}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all relative overflow-hidden ${
                  entry.username?.toUpperCase() === user?.toUpperCase() 
                    ? 'bg-neon-cyan/20 border-neon-cyan shadow-[0_0_10px_rgba(0,243,255,0.3)]' 
                    : 'bg-black/40 border-neon-cyan/10'
                }`}
              >
                {i === 0 && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-neon-pink shadow-[0_0_10px_rgba(255,0,255,0.8)]" />}
                {i === 1 && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-neon-cyan shadow-[0_0_10px_rgba(0,243,255,0.8)]" />}
                {i === 2 && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-neon-green shadow-[0_0_10px_rgba(0,255,65,0.8)]" />}
                
                <div className="flex items-center gap-2 pl-2 flex-1 min-w-0">
                  <span className={`w-6 text-center text-sm font-bold shrink-0 ${i === 0 ? 'text-neon-pink' : i === 1 ? 'text-neon-cyan' : i === 2 ? 'text-neon-green' : 'text-neon-cyan/40'}`}>
                    {i + 1}
                  </span>
                  <span className="text-base flex-1 truncate">{entry.username?.toUpperCase() || 'ANONYMOUS'}</span>
                </div>
                <span className={`text-xl tracking-widest shrink-0 tabular-nums ${i === 0 ? 'text-neon-pink' : i === 1 ? 'text-neon-cyan' : i === 2 ? 'text-neon-green' : 'text-white'}`}>
                  {entry.score.toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-neon-pink/50 border border-neon-pink/20 rounded-xl bg-neon-pink/5">No Data.</div>
          )}
        </div>

        {/* Sticky My Rank */}
        {activeTab === 'global' && user && userRank && (
          <div className="shrink-0 mt-2 p-3 bg-neon-cyan/20 border border-neon-cyan rounded-xl flex justify-between items-center backdrop-blur-md" onClick={scrollToMyRank}>
            <span className="text-sm text-neon-cyan uppercase">Your Rank:</span>
            <span className="text-2xl text-white font-bold">#{userRank}</span>
          </div>
        )}
      </div>
    );
  }

  // --- DESKTOP VERSION ---
  return (
    <div className="w-full lg:w-[1164px] lg:max-w-full max-w-4xl lg:h-[850px] max-h-full flex flex-col animate-glitch-entry font-vt323 p-6 md:p-10 bg-[#030707]/80 border border-neon-cyan/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-20 backdrop-blur-md rounded-xl">
      <div className="absolute top-2 left-2 text-[10px] text-neon-cyan/50">+</div>
      <div className="absolute bottom-2 right-2 text-[10px] text-neon-cyan/50">+</div>

      {/* HEADER & TABS */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-3xl md:text-4xl text-white tracking-[0.2em] uppercase font-light drop-shadow-[0_0_12px_rgba(0,243,255,0.4)] mb-3">
            Score_Database
          </h2>
          <div className="flex gap-6 text-xs md:text-sm tracking-[0.3em]">
            <button onClick={() => setActiveTab('global')} className={`transition-all duration-300 ${activeTab === 'global' ? 'text-neon-cyan drop-shadow-[0_0_5px_rgba(0,243,255,0.8)]' : 'text-neon-cyan/40 hover:text-neon-cyan/80'}`}>[ GLOBAL ]</button>
            <button onClick={() => setActiveTab('personal')} className={`transition-all duration-300 ${activeTab === 'personal' ? 'text-neon-pink drop-shadow-[0_0_5px_rgba(255,0,255,0.8)]' : 'text-neon-pink/40 hover:text-neon-pink/80'}`}>[ PERSONAL ]</button>
          </div>
        </div>
        <button onClick={() => navigate('menu')} className="text-neon-cyan/40 hover:text-neon-pink transition-colors text-sm tracking-[0.2em] uppercase">
          &lt; EXIT_NODE
        </button>
      </div>

      {/* GAME SELECTOR */}
      <div className="flex gap-8 mb-6 text-sm tracking-[0.2em] uppercase px-4 shrink-0 overflow-x-auto custom-scrollbar pb-2">
        {[{id: 'snake', label: 'NEURAL_SNAKE'}, {id: 'tetris', label: 'BLOCK_ENCRYPT'}, {id: 'spaceinvaders', label: 'ALIEN_THREAT'}, {id: 'breakout', label: 'FIREWALL_BREACH'}].map(game => (
          <button 
            key={game.id} onClick={() => setActiveGame(game.id)}
            className={`transition-all duration-300 relative pb-1 whitespace-nowrap ${activeGame === game.id ? 'text-neon-cyan' : 'text-neon-cyan/40 hover:text-neon-cyan/80'}`}
          >
            {game.label}
            {activeGame === game.id && <span className="absolute bottom-0 left-0 w-full h-[1px] bg-neon-cyan shadow-[0_0_8px_rgba(0,243,255,0.8)]" />}
          </button>
        ))}
      </div>

      {/* TABLE HEADER */}
      <div className="hidden md:flex border-b border-white/5 pb-2 mb-2 text-white/30 text-xs tracking-[0.4em] uppercase px-6">
        <div className="w-12 text-center">RNK</div>
        <div className="flex-1 pl-0">AGENT_ID</div>
        <div className="w-24 text-right mr-12">LOG_DATE</div>
        <div className="w-32 text-right">CREDITS</div>
      </div>

      {/* LISTE */}
      <div className="flex flex-col gap-1 overflow-y-auto flex-1 min-h-0 pr-2 md:pr-4 custom-scrollbar">
        {loading ? (
          <div className="text-center py-20 text-white/50 animate-pulse text-xl uppercase tracking-[0.5em]">
            Decrypting_Records...
          </div>
        ) : scores.length > 0 ? (
          scores.map((entry, i) => (
            <div 
              key={entry.id} 
              id={`rank-row-${entry.username ? entry.username.toUpperCase() : 'ANONYMOUS'}`}
              className={`flex items-center justify-between py-3 px-2 md:px-6 transition-all duration-300 group relative border-b border-white/5 last:border-b-0 ${
                entry.username?.toUpperCase() === user?.toUpperCase()
                  ? 'bg-neon-cyan/5 border-l-2 border-neon-cyan shadow-[inset_20px_0_20px_-20px_rgba(0,243,255,0.2)]'
                  : 'bg-transparent border-l-2 border-transparent hover:bg-white/5'
              }`}
            >
              {i === 0 && <div className="absolute left-0 top-1 bottom-1 w-[2px] bg-neon-pink shadow-[0_0_8px_rgba(255,0,255,0.8)]" />}
              {i === 1 && <div className="absolute left-0 top-1 bottom-1 w-[2px] bg-neon-cyan shadow-[0_0_8px_rgba(0,243,255,0.8)]" />}
              {i === 2 && <div className="absolute left-0 top-1 bottom-1 w-[2px] bg-neon-green shadow-[0_0_8px_rgba(0,255,65,0.8)]" />}
              
              <div className="flex items-center gap-2 md:gap-6 pl-2 md:pl-0 flex-1 min-w-0">
                <span className={`w-8 md:w-12 text-center text-sm md:text-base shrink-0 tracking-widest ${i === 0 ? 'text-neon-pink' : i === 1 ? 'text-neon-cyan' : i === 2 ? 'text-neon-green' : 'text-white/30'}`}>
                  {(i + 1).toString().padStart(2, '0')}
                </span>
                <span className={`text-base md:text-lg tracking-[0.2em] transition-all truncate flex-1 ${i === 0 ? 'text-white' : 'text-neon-cyan/60 group-hover:text-neon-cyan'}`}>
                  {entry.username ? entry.username.toUpperCase() : 'ANONYMOUS'}
                </span>
              </div>
              <div className="flex items-center gap-4 md:gap-12 shrink-0">
                <span className="w-24 text-right text-white/30 text-xs md:text-sm hidden md:block uppercase group-hover:text-white/60 transition-colors tracking-wider">
                  {entry.created_at ? new Date(entry.created_at).toLocaleDateString() : 'N/A'}
                </span>
                <span className={`text-lg md:text-xl tabular-nums tracking-[0.1em] w-20 md:w-32 text-right shrink-0 ${i === 0 ? 'text-neon-pink drop-shadow-[0_0_5px_rgba(255,0,255,0.5)]' : i === 1 ? 'text-neon-cyan drop-shadow-[0_0_5px_rgba(0,243,255,0.5)]' : i === 2 ? 'text-neon-green' : 'text-white/80'}`}>
                  {entry.score.toString().padStart(7, '0')}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 text-neon-pink/50 text-xl tracking-widest border border-white/5 bg-white/5 rounded-lg">
            {activeTab === 'personal' && !user 
              ? 'ACCESS_DENIED: LOGIN_REQUIRED_FOR_PERSONAL_DATA' 
              : 'NO_DATA_FOUND_IN_THIS_SECTOR'}
          </div>
        )}
      </div>

      {/* EIGENER RANG */}
      {activeTab === 'global' && user && (
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 px-4 shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-xs md:text-sm text-white/40 tracking-[0.2em] uppercase">Current_Agent:</span>
            <span className="text-sm md:text-base text-neon-cyan tracking-widest uppercase">{user.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-6">
            {userRank && userRank <= scores.length && (
              <button 
                onClick={scrollToMyRank}
                className="text-xs uppercase tracking-widest text-white/40 hover:text-neon-cyan transition-colors"
              >
                [ LOCATE ]
              </button>
            )}
            <span className="text-lg md:text-xl text-white tracking-[0.2em]">
              {userRank ? `RNK ${userRank.toString().padStart(3, '0')}` : 'UNRANKED'}
            </span>
          </div>
        </div>
      )}

      {/* DECORATION */}
      <div className="mt-4 flex justify-between text-[10px] text-white/20 uppercase tracking-[0.3em] shrink-0 px-4">
        <span>Encryption: AES-256</span>
        <span>Source: Neural_Link_Cloud</span>
      </div>
    </div>
  );
}
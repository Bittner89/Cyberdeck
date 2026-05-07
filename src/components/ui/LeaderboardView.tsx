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
    <div className="w-full lg:w-[1164px] lg:max-w-full max-w-4xl lg:h-[850px] max-h-full flex flex-col animate-glitch-entry font-vt323 p-3 md:p-8 bg-black/90 border-2 border-neon-cyan shadow-neon-big relative z-20 chamfer">
      <div className="absolute top-2 left-2 text-[10px] text-neon-cyan/50">+</div>
      <div className="absolute bottom-2 right-2 text-[10px] text-neon-cyan/50">+</div>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-0 mb-4 md:mb-8 border-b-2 border-neon-cyan pb-4">
        <h2 className="text-2xl md:text-4xl text-neon-cyan tracking-tighter uppercase italic text-center md:text-left">
          {activeTab === 'global' ? '::Global_Leaderboard::' : '::Personal_Archive::'}
        </h2>
        <button 
          onClick={() => navigate('menu')} 
          className="text-neon-pink hover:bg-neon-pink hover:text-black border border-neon-pink w-full md:w-auto px-4 md:px-6 py-1 transition-all chamfer-btn text-sm md:text-base"
        >
          BACK_TO_MENU
        </button>
      </div>

      {/* GAME SELECTOR */}
      <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 md:gap-4 mb-4">
        <button 
          onClick={() => setActiveGame('snake')}
          className={`flex-1 py-1 border transition-all duration-300 chamfer-btn text-xs md:text-base ${activeGame === 'snake' ? 'bg-neon-cyan/20 text-white border-neon-cyan shadow-[0_0_10px_rgba(0,243,255,0.3)]' : 'text-neon-cyan/50 border-neon-cyan/20 hover:border-neon-cyan/50 hover:text-neon-cyan bg-black/50'}`}
        >
          GAME: NEURAL_SNAKE
        </button>
        <button 
          onClick={() => setActiveGame('tetris')}
          className={`flex-1 py-1 border transition-all duration-300 chamfer-btn text-xs md:text-base ${activeGame === 'tetris' ? 'bg-neon-cyan/20 text-white border-neon-cyan shadow-[0_0_10px_rgba(0,243,255,0.3)]' : 'text-neon-cyan/50 border-neon-cyan/20 hover:border-neon-cyan/50 hover:text-neon-cyan bg-black/50'}`}
        >
          GAME: BLOCK_ENCRYPT
        </button>
      <button 
        onClick={() => setActiveGame('spaceinvaders')}
        className={`flex-1 py-1 border transition-all duration-300 chamfer-btn text-xs md:text-base ${activeGame === 'spaceinvaders' ? 'bg-neon-cyan/20 text-white border-neon-cyan shadow-[0_0_10px_rgba(0,243,255,0.3)]' : 'text-neon-cyan/50 border-neon-cyan/20 hover:border-neon-cyan/50 hover:text-neon-cyan bg-black/50'}`}
      >
        GAME: ALIEN_THREAT
      </button>
        <button 
          onClick={() => setActiveGame('breakout')}
          className={`flex-1 py-1 border transition-all duration-300 chamfer-btn text-xs md:text-base ${activeGame === 'breakout' ? 'bg-neon-cyan/20 text-white border-neon-cyan shadow-[0_0_10px_rgba(0,243,255,0.3)]' : 'text-neon-cyan/50 border-neon-cyan/20 hover:border-neon-cyan/50 hover:text-neon-cyan bg-black/50'}`}
        >
          GAME: FIREWALL_BREACH
        </button>
      </div>

      {/* TABS */}
      <div className="flex gap-2 md:gap-4 mb-4 md:mb-6">
        <button 
          onClick={() => setActiveTab('global')}
          className={`flex-1 py-2 border-2 transition-all duration-300 chamfer-btn text-xs md:text-base ${activeTab === 'global' ? 'bg-neon-cyan text-black border-neon-cyan shadow-neon' : 'bg-black/50 text-neon-cyan border-neon-cyan/30 hover:border-neon-cyan'}`}
        >
          GLOBAL_NET_SCORES
        </button>
        <button 
          onClick={() => setActiveTab('personal')}
          className={`flex-1 py-2 border-2 transition-all duration-300 chamfer-btn text-xs md:text-base ${activeTab === 'personal' ? 'bg-neon-pink text-black border-neon-pink shadow-neon-pink' : 'bg-black/50 text-neon-pink border-neon-pink/30 hover:border-neon-pink'}`}
        >
          PERSONAL_RECORDS ({user || 'GHOST'})
        </button>
      </div>

      {/* LISTE */}
      <div className="grid grid-cols-1 gap-2 overflow-y-auto flex-1 min-h-0 pr-2 md:pr-4 custom-scrollbar">
        {loading ? (
          <div className="text-center py-20 text-neon-cyan animate-pulse text-2xl uppercase tracking-[0.5em]">
            Accessing_Database...
          </div>
        ) : scores.length > 0 ? (
          scores.map((entry, i) => (
            <div 
              key={entry.id} 
              id={`rank-row-${entry.username ? entry.username.toUpperCase() : 'ANONYMOUS'}`}
              className={`flex items-center justify-between p-2 md:p-3 border transition-all duration-300 group relative ${
                entry.username?.toUpperCase() === user?.toUpperCase()
                  ? 'bg-neon-cyan/20 border-neon-cyan shadow-[0_0_10px_rgba(0,243,255,0.3)]'
                  : 'bg-black/40 border-neon-cyan/10 hover:bg-neon-cyan/20 hover:border-neon-cyan/50'
              }`}
            >
              {i === 0 && <div className="absolute left-0 top-0 bottom-0 w-1 md:w-1.5 bg-neon-pink shadow-[0_0_15px_rgba(255,0,255,0.8)]" />}
              {i === 1 && <div className="absolute left-0 top-0 bottom-0 w-1 md:w-1.5 bg-neon-cyan shadow-[0_0_15px_rgba(0,243,255,0.8)]" />}
              {i === 2 && <div className="absolute left-0 top-0 bottom-0 w-1 md:w-1.5 bg-neon-green shadow-[0_0_15px_rgba(0,255,65,0.8)]" />}
              
              <div className="flex items-center gap-2 md:gap-4 pl-2 md:pl-4 flex-1 min-w-0">
                <span className={`w-6 md:w-8 text-center text-sm md:text-xl shrink-0 ${i === 0 ? 'text-neon-pink' : i === 1 ? 'text-neon-cyan' : i === 2 ? 'text-neon-green' : 'opacity-40'}`}>
                  {i + 1}
                </span>
                <span className="text-base md:text-xl tracking-widest group-hover:text-white group-hover:translate-x-1 transition-all truncate flex-1">
                  {entry.username ? entry.username.toUpperCase() : 'ANONYMOUS'}
                </span>
              </div>
              <div className="flex items-center gap-4 md:gap-12 shrink-0">
                <span className="text-neon-cyan/40 text-xs md:text-sm hidden md:block uppercase group-hover:text-neon-cyan/80 transition-colors">
                  {entry.created_at ? new Date(entry.created_at).toLocaleDateString() : 'N/A'}
                </span>
                <span className={`text-lg md:text-2xl tabular-nums w-20 md:w-32 text-right shrink-0 ${i === 0 ? 'text-neon-pink shadow-neon' : i === 1 ? 'text-neon-cyan shadow-neon' : i === 2 ? 'text-neon-green shadow-neon' : 'text-white shadow-neon'}`}>
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

      {/* EIGENER RANG */}
      {activeTab === 'global' && user && (
        <div className="mt-2 md:mt-4 pt-2 md:pt-4 border-t-2 border-neon-cyan/30 flex flex-col md:flex-row justify-between items-center gap-2 md:gap-0 p-2 md:px-4 bg-neon-cyan/10 border-b md:pb-4 shrink-0">
          <span className="text-base md:text-xl text-neon-cyan tracking-widest uppercase text-center md:text-left">AGENT_RANK // {user.toUpperCase()}:</span>
          <div className="flex items-center gap-3 md:gap-6">
            {userRank && userRank <= scores.length && (
              <button 
                onClick={scrollToMyRank}
                className="text-xs md:text-sm uppercase border border-neon-cyan px-2 md:px-4 py-1 text-neon-cyan hover:bg-neon-cyan hover:text-black transition-all shadow-[0_0_10px_rgba(0,243,255,0.2)]"
              >
                [ JUMP_TO_POSITION ]
              </button>
            )}
            <span className="text-2xl md:text-4xl text-neon-pink [text-shadow:0_0_15px_rgba(255,0,255,0.8)] font-bold">
              {userRank ? `#${userRank}` : 'UNRANKED'}
            </span>
          </div>
        </div>
      )}

      {/* DECORATION */}
      <div className="mt-6 flex justify-between text-[10px] text-neon-cyan/30 uppercase tracking-[0.2em] shrink-0">
        <span>Encryption: AES-256</span>
        <span>Source: Neural_Link_Cloud</span>
      </div>
    </div>
  );
}
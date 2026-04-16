import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import GameService from '../game/gameService.js';

// Layout & Components
import Header from '../../components/layout/Header.jsx';
import BottomDock from '../../components/layout/BottomDock.jsx';
import ModeCard from '../../components/dashboard/ModeCard.jsx';
import StatCard from '../../components/dashboard/StatCard.jsx';
import GameSetupModal from '../../components/game/GameSetupModal.jsx';

export default function DashboardView() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [recentGames, setRecentGames] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const result = await GameService.getMatchHistory({ page: 1, limit: 5 });
      setRecentGames(Array.isArray(result.items) ? result.items : []);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className={`min-h-screen bg-surface text-on-surface font-body selection:bg-primary selection:text-on-primary ${isSetupModalOpen ? 'overflow-hidden' : ''}`}>
      <Header user={user} />

      <main className={`min-h-screen pt-32 pb-40 px-6 flex flex-col items-center relative overflow-hidden transition-all duration-500 ${isSetupModalOpen ? 'blur-md scale-[0.98] pointer-events-none' : ''}`}>
        {/* Background Atmospheric Element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Hero Section */}
        <section className="text-center mb-16 relative z-10">
          <h2 className="text-6xl md:text-8xl font-extrabold font-headline tracking-tighter text-on-surface neon-glow mb-4">
            TicTacToang
          </h2>
          <p className="text-on-surface-variant max-w-xl mx-auto text-lg md:text-xl font-light tracking-wide">
            Welcome back, <span className="text-primary font-bold">{user?.username || 'Player'}</span>. 
            Experience the classic game evolved through an ethereal digital landscape.
          </p>
        </section>

        {/* Mode Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full max-w-6xl relative z-10 mb-12">
          <ModeCard 
            title="Local Mode"
            description="Battle a friend side-by-side. 2 players, same device, infinite rivalry."
            icon="group"
            actionLabel="Start Duel"
            actionIcon="arrow_forward"
            onClick={() => navigate('/game-setup?mode=local')}
          />

          <ModeCard 
            isFeatured={true}
            spanCols="md:col-span-4"
            title="AI Mode"
            description="Challenge the Aetheris Core. Can you outwit our adaptive tactical engine?"
            icon="smart_toy"
            actionLabel="Initialize AI"
            actionIcon="memory"
            onClick={() => setIsSetupModalOpen(true)}
          />

          <ModeCard 
            title="Online Lobby"
            description="Enter the global arena. Match with legends from around the world."
            icon="public"
            actionLabel="Join Queue"
            actionIcon="public"
            onClick={() => navigate('/arena')}
          >
             <div className="mt-4 flex -space-x-3 mb-4">
               {[1, 2].map(i => (
                 <div key={i} className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container-highest overflow-hidden">
                   <img alt="Portrait" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`} />
                 </div>
               ))}
               <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container-highest flex items-center justify-center text-[10px] font-bold text-primary">
                 +14k
               </div>
             </div>
          </ModeCard>
        </div>

        {/* Stats Section */}
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          <StatCard 
            icon="emoji_events"
            label="Total Wins"
            value={recentGames.length} 
          />
          <StatCard 
            icon="military_tech"
            label="ELO Rating"
            value="1200"
          />
          <StatCard 
            icon="schedule"
            label="Daily Streak"
            value="14 Days"
          >
             <div className="flex gap-1">
              {[1, 2, 3].map(i => <div key={i} className="w-2 h-6 bg-primary rounded-full"></div>)}
              {[1, 2].map(i => <div key={i} className="w-2 h-6 bg-primary/20 rounded-full"></div>)}
            </div>
          </StatCard>
        </div>
      </main>

      <BottomDock />

      {/* AI Setup Modal */}
      <GameSetupModal 
        isOpen={isSetupModalOpen} 
        onClose={() => setIsSetupModalOpen(false)} 
      />
    </div>
  );
}


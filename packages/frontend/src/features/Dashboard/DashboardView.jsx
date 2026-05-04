import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Update import paths
import { useAuthStore } from '../../app/store/authStore.js';
import Header from '../../shared/components/layout/Header.jsx';
import BottomDock from '../../shared/components/layout/BottomDock.jsx';
import ModeCard from './components/ModeCard.jsx';
import GameSetupModal from '../../features/Game/components/GameSetupModal.jsx';

export default function DashboardView() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [setupMode, setSetupMode] = useState('AI');

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
            onClick={() => {
              setSetupMode('LOCAL');
              setIsSetupModalOpen(true);
            }}
          />

          <ModeCard
            isFeatured={true}
            spanCols="md:col-span-4"
            title="AI Mode"
            description="Challenge the Aetheris Core. Can you outwit our adaptive tactical engine?"
            icon="smart_toy"
            actionLabel="Initialize AI"
            actionIcon="memory"
            onClick={() => {
              setSetupMode('AI');
              setIsSetupModalOpen(true);
            }}
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
      </main>

      <BottomDock />

      {/* AI Setup Modal */}
      <GameSetupModal
        isOpen={isSetupModalOpen}
        mode={setupMode}
        onClose={() => setIsSetupModalOpen(false)}
      />
    </div>
  );
}

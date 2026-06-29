import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthUser } from '../../app/store/authStore.js';
import ModeCard from './components/ModeCard.jsx';
import GameSetupModal from '../game/components/GameSetupModal.jsx';
import Lightfall from '../../shared/components/ui/lightfall/Lightfall.jsx';

export default function DashboardView() {
  const navigate = useNavigate();
  const user = useAuthUser();
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [setupMode, setSetupMode] = useState('AI');

  return (
    <div className={`min-h-screen bg-surface text-on-surface font-body selection:bg-primary selection:text-on-primary relative ${isSetupModalOpen ? 'overflow-hidden' : ''}`}>
      
      {/* Lightfall Background */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <Lightfall
          colors={['#A6C8FF', '#5227FF', '#FF9FFC']}
          backgroundColor="#0A29FF"
          speed={0.5}
          streakCount={2}
          streakWidth={1}
          streakLength={1}
          glow={1}
          density={0.6}
          twinkle={1}
          zoom={3}
          backgroundGlow={0.5}
          opacity={1}
          mouseInteraction={true}
          mouseStrength={0.5}
          mouseRadius={1}
        />
      </div>

      <main className={`min-h-screen pt-32 pb-40 px-6 flex flex-col items-center relative z-10 overflow-hidden transition-all duration-500 ${isSetupModalOpen ? 'blur-md scale-[0.98] pointer-events-none' : ''}`}>
        
        {/* Hero Section */}
        <section className="text-center mb-16 relative z-10">
          <h2 className="text-6xl md:text-8xl font-extrabold font-headline tracking-tighter text-on-surface neon-glow mb-4">
            TicTacToang
          </h2>
          <p className="text-on-surface-variant max-w-xl mx-auto text-lg md:text-xl font-light tracking-wide">
            Welcome back, <span className="text-primary font-bold">{user?.username}</span>.
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
          />
        </div>
      </main>
      
      {/* AI Setup Modal */}
      <GameSetupModal
        isOpen={isSetupModalOpen}
        mode={setupMode}
        onClose={() => setIsSetupModalOpen(false)}
      />
    </div>
  );
}

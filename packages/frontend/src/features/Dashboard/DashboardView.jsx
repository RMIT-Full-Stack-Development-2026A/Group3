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
          colors={['#c3ff4a', '#eaffb8', '#ffffff']}
          backgroundColor="#0a0e05"
          speed={0.5}
          streakCount={2}
          streakWidth={1}
          streakLength={1}
          glow={0.8}
          density={0.45}
          twinkle={1}
          zoom={3}
          backgroundGlow={0.2}
          opacity={1}
          mouseInteraction={true}
          mouseStrength={0.5}
          mouseRadius={1}
        />
      </div>

      <main className={`min-h-screen pt-20 md:pt-28 pb-40 px-6 flex flex-col items-center relative z-10 overflow-hidden transition-all duration-500 ${isSetupModalOpen ? 'blur-md scale-[0.98] pointer-events-none' : ''}`}>

        {/* Hero Section */}
        <section className="text-center mb-10 relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold font-headline tracking-tight text-on-surface mb-3">
            Welcome back, <span className="text-volt">{user?.username}</span>
          </h2>
          <p className="text-on-surface-variant max-w-xl mx-auto text-base md:text-lg font-light tracking-wide">
            Pick a mode and queue up your next match.
          </p>
        </section>

        {/* Mode Grid: horizontal scroll-snap on mobile (keeps first-paint height under one card,
            so content never collides with the fixed BottomDock), real grid from md: up */}
        <div className="flex overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory gap-4 -mx-6 px-6 md:grid md:grid-cols-12 md:gap-6 md:mx-0 md:px-0 w-full max-w-6xl relative z-10 mb-12">
          <ModeCard
            title="Local Mode"
            description="Battle a friend side-by-side. 2 players, same device, infinite rivalry."
            icon="group"
            actionLabel="Start Duel"
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

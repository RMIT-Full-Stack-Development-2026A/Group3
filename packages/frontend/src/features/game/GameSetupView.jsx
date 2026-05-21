import React from 'react';
import Header from '../../shared/components/layout/Header';
import GameSetupModal from './components/GameSetupModal';

const GameSetupView = () => {
  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <div className="pt-32 flex items-center justify-center">
        <GameSetupModal isOpen={true} />
      </div>
    </div>
  );
};

export default GameSetupView;

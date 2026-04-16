import React from 'react';
import { useNavigate } from 'react-router-dom';

const GameSetupView = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 text-on-surface">
      <div className="text-center">
        <h1 className="text-3xl font-headline font-bold mb-4 text-primary">Game Setup</h1>
        <p className="text-on-surface-variant mb-8">Ready to duel? Setup your arena here.</p>
        <button onClick={() => navigate('/dashboard')} className="text-primary hover:underline">Return to Dashboard</button>
      </div>
    </div>
  );
};

export default GameSetupView;

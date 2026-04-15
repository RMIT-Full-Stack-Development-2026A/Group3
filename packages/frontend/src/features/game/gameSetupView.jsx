import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, Circle, Triangle, Square, Diamond, Star, X as XIcon } from 'lucide-react';
import { Navigation } from '../../components/Navigation.jsx';
import { Card } from '../../components/Card.jsx';
import { Button } from '../../components/Button.jsx';
import { Badge } from '../../components/Badge.jsx';
import { useAuthStore } from '../../store/authStore.js';
import GameService from '../game/gameService.js';

/**
 * GameSetupView - Unified Game Configuration.
 * Real Logic: Consumes AuthStore (Layer 5) for user context.
 */
export default function GameSetupView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'local';

  const { user } = useAuthStore();
  
  const [boardSize, setBoardSize] = useState('10');
  const [marker, setMarker] = useState('x');
  const [firstPlayer, setFirstPlayer] = useState(1);

  const markers = [
    { id: 'x', icon: XIcon, label: 'X' },
    { id: 'o', icon: Circle, label: 'O' },
    { id: 'triangle', icon: Triangle, label: 'Triangle' },
    { id: 'square', icon: Square, label: 'Square' },
    { id: 'diamond', icon: Diamond, label: 'Diamond' },
    { id: 'star', icon: Star, label: 'Star' },
  ];

  const handleStartGame = () => {
    const path = mode === 'ai' ? '/game/ai' : '/game/offline';
    navigate(`${path}?size=${boardSize}&marker=${marker}&first=${firstPlayer}`);
  };

  return (
    <div className="min-h-screen bg-page">
      <Navigation />
      
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <Card className="w-full max-w-2xl p-8 relative bg-surface border-border shadow-2xl">
          <button
            onClick={() => navigate('/dashboard')}
            className="absolute top-4 right-4 text-text-secondary hover:text-gold transition-colors"
          >
            <XIcon size={24} />
          </button>

          <h2 className="text-3xl font-orbitron mb-2 text-gold">Arena Setup</h2>
          <p className="text-text-secondary mb-8">
            Greetings, <span className="text-white font-bold">{user?.username}</span>. Co nfigure your {mode === 'local' ? 'local spar' : 'AI duel'}.
          </p>

          <div className="mb-8">
            <label className="block mb-3 text-text-primary font-semibold">Board Size</label>
            <div className="flex gap-4">
              {['10', '15'].map((size) => (
                <button
                  key={size}
                  onClick={() => setBoardSize(size)}
                  className={`flex-1 py-4 px-6 rounded-lg border-2 transition-all font-orbitron ${
                    boardSize === size
                      ? 'border-gold bg-gold/10 text-gold shadow-[0_0_15px_rgba(244,171,0,0.2)]'
                      : 'border-border text-text-secondary hover:border-gold/50'
                  }`}
                >
                  <span className="font-bold text-lg">{size} × {size}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <label className="block mb-3 text-text-primary font-semibold">Your Marker</label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {markers.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMarker(m.id)}
                    className={`p-4 rounded-lg border-2 transition-all flex items-center justify-center ${
                      marker === m.id
                        ? 'border-gold bg-gold/10 text-gold shadow-[0_0_10px_rgba(244,171,0,0.2)]'
                        : 'border-border text-text-secondary hover:border-gold/50'
                    }`}
                  >
                    <Icon size={28} />
                  </button>
                );
              })}
            </div>
          </div>

          {mode === 'local' && (
            <div className="mb-8">
              <label className="block mb-3 text-text-primary font-semibold">Who goes first?</label>
              <div className="flex gap-4">
                <button
                  onClick={() => setFirstPlayer(1)}
                  className={`flex-1 py-3 px-6 rounded-lg border-2 transition-all font-medium ${
                    firstPlayer === 1
                      ? 'border-coral bg-coral/10 text-coral shadow-[0_0_10px_rgba(255,107,107,0.2)]'
                      : 'border-border text-text-secondary hover:border-coral/50'
                  }`}
                >
                  Player 1 (Coral)
                </button>
                <button
                  onClick={() => setFirstPlayer(2)}
                  className={`flex-1 py-3 px-6 rounded-lg border-2 transition-all font-medium ${
                    firstPlayer === 2
                      ? 'border-teal bg-teal/10 text-teal shadow-[0_0_10px_rgba(0,201,177,0.2)]'
                      : 'border-border text-text-secondary hover:border-teal/50'
                  }`}
                >
                  Player 2 (Teal)
                </button>
              </div>
            </div>
          )}

          <Button 
            onClick={handleStartGame} 
            className="w-full py-6 text-lg font-orbitron bg-gold-gradient hover:scale-[1.01] transition-transform"
          >
            Enter the Grid
          </Button>
        </Card>
      </div>
    </div>
  );
}


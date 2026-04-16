import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Bot, Globe, Calendar, RefreshCcw } from 'lucide-react';
import { Navigation } from '../../components/Navigation.jsx';
import { Card } from '../../components/Card.jsx';
import { Button } from '../../components/Button.jsx';
import { Badge } from '../../components/Badge.jsx';
import { useAuthStore } from '../../store/authStore.js';
import GameService from '../game/gameService.js';

/**
 * DashboardView - The central hub after login.
 * Real Logic: Fetches Match History and Auth Context (Layer 5/6).
 */
export default function DashboardView() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [recentGames, setRecentGames] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Real Data Fetching (GET /api/v1/game/history)
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
    <div className="min-h-screen bg-page text-text-primary">
      {/* Real State-Powered Navigation */}
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-orbitron mb-4">
            Welcome back, <span className="text-gold">{user?.username || 'Player'}</span>
          </h1>
          <p className="text-text-secondary text-lg">Choose your game mode and dominate the arena</p>
        </div>

        {/* Game Mode Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card 
            hover={true}
            className="p-8 text-center cursor-pointer border-border hover:border-coral/50 transition-all bg-surface"
            onClick={() => navigate('/game-setup?mode=local')}
          >
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-coral/20 flex items-center justify-center">
                <Users size={32} className="text-coral" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">Local Match</h3>
            <p className="text-text-secondary">Play with a friend on the same device</p>
          </Card>

          <Card 
            hover={true}
            className="p-8 text-center cursor-pointer border-border hover:border-gold/50 transition-all bg-surface"
            onClick={() => navigate('/game-setup?mode=ai')}
          >
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center">
                <Bot size={32} className="text-gold" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">vs AI</h3>
            <p className="text-text-secondary">Challenge the computer opponent</p>
          </Card>

          <Card 
            hover={true}
            className="p-8 text-center cursor-pointer border-border hover:border-teal/50 transition-all bg-surface"
            onClick={() => navigate('/arena')}
          >
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-teal/20 flex items-center justify-center">
                <Globe size={32} className="text-teal" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">Online Arena</h3>
            <p className="text-text-secondary">Compete against players worldwide</p>
          </Card>
        </div>

        {/* Match History (Real Sync) */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-orbitron">Recent Games</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => navigate('/match-history')}
                className="border-border text-text-secondary"
              >
                View all
              </Button>

              <button 
                onClick={fetchHistory}
                className="p-2 text-text-secondary hover:text-gold transition-colors"
                title="Refresh"
              >
                <RefreshCcw size={18} className={loadingHistory ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {loadingHistory ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-surface/50 animate-pulse rounded-xl border border-border" />
              ))}
            </div>
          ) : recentGames.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-border flex flex-col items-center">
              <p className="text-text-secondary mb-4 italic">No matches played yet. Start your first game!</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {recentGames.map((game) => (
                <Card key={game.id} className="p-6 border-border bg-surface hover:border-gold/30 transition-all">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <Calendar size={20} className="text-text-secondary" />
                      <div>
                        <p className="text-text-primary font-semibold">vs {game.opponentName || game.opponent || 'Unknown'}</p>
                        <p className="text-text-secondary text-sm">
                          {game.playedAt ? new Date(game.playedAt).toLocaleString() : game.createdAt || game.date || 'Unknown date'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={game.result === 'WIN' ? 'success' : game.result === 'LOSS' ? 'danger' : 'secondary'}>
                        {(game.result || 'DRAW').toUpperCase()}
                      </Badge>
                      <span className="text-text-secondary text-sm font-mono">
                        {typeof game.boardSize === 'number' ? `${game.boardSize}x${game.boardSize}` : '10x10'}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


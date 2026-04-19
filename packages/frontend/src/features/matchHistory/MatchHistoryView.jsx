import React from 'react';
import { useMatchHistory } from './matchHistoryHook';
import Header from '../../shared/components/layout/Header';
import BottomDock from '../../shared/components/layout/BottomDock';
import { Card } from '../../shared/components/Card';
import { Badge } from '../../shared/components/Badge';

const MatchHistoryView = () => {
  const { history, loading, error } = useMatchHistory();

  if (loading) return <div className="min-h-screen bg-surface flex items-center justify-center text-white">Loading History...</div>;

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Header />
      <main className="pt-32 pb-24 px-6 max-w-5xl mx-auto">
        <h1 className="text-4xl font-headline font-extrabold mb-10 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Battle Records</h1>
        
        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
              <p className="text-on-surface-variant">No battles recorded yet. Start your first match!</p>
            </div>
          ) : (
            history.map(match => (
              <Card key={match.id} className="p-6 flex items-center justify-between border-white/5 hover:border-primary/30 transition-all group">
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl
                    ${match.result === 'WIN' ? 'bg-emerald-500/20 text-emerald-400' : 
                      match.result === 'LOSS' ? 'bg-rose-500/20 text-rose-400' : 
                      'bg-white/10 text-on-surface-variant'}
                  `}>
                    {match.result[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">vs {match.opponent}</h3>
                    <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">
                      {new Date(match.date).toLocaleDateString()} • {match.mode} {match.difficulty ? `(${match.difficulty})` : ''}
                    </p>
                  </div>
                </div>
                <Badge variant={match.result === 'WIN' ? 'success' : match.result === 'LOSS' ? 'danger' : 'neutral'}>
                  {match.result}
                </Badge>
              </Card>
            ))
          )}
        </div>
      </main>
      <BottomDock />
    </div>
  );
};

export default MatchHistoryView;

import React from 'react';

const StatCard = ({ icon, label, value, spanCols = 'md:col-span-1', children }) => {
  return (
    <div className={`${spanCols} bg-surface-container-low/30 p-6 rounded-xl border border-outline-variant/10 flex items-center justify-between`}>
      <div className="flex items-center gap-4">
        <span className="material-symbols-outlined text-primary/80">{icon}</span>
        <div>
          <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">{label}</p>
          <p className="text-xl font-headline font-bold">{value}</p>
        </div>
      </div>
      {children}
    </div>
  );
};

export default StatCard;

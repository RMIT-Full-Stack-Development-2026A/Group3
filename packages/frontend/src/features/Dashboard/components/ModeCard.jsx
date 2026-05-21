import React from 'react';

const ModeCard = ({ 
  title, 
  description, 
  icon, 
  actionLabel, 
  actionIcon, 
  isFeatured = false, 
  spanCols = 'md:col-span-4',
  onClick,
  children 
}) => {
  const baseClasses = isFeatured 
    ? "h-full glass-card bg-primary/5 border border-primary/20 rounded-xl p-8 transition-all duration-500 hover:bg-primary/10 hover:-translate-y-2 flex flex-col justify-between overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
    : "h-full glass-xcard bg-surface-container-high/40 border border-outline-variant/15 rounded-xl p-8 transition-all duration-500 hover:bg-surface-container-highest/60 hover:-translate-y-2 flex flex-col justify-between overflow-hidden relative";

  const iconBgClasses = isFeatured
    ? "w-14 h-14 rounded-lg bg-primary/20 flex items-center justify-center mb-6 text-primary shadow-lg"
    : "w-12 h-12 rounded-lg bg-surface-bright flex items-center justify-center mb-6 text-primary shadow-inner";

  return (
    <div className={`${spanCols} group cursor-pointer`} onClick={onClick}>
      <div className={baseClasses}>
        {/* Glow effect for featured card */}
        {isFeatured && (
          <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
            <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent"></div>
          </div>
        )}
        
        {/* Ambient background blur for normal cards */}
        {!isFeatured && (
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors"></div>
        )}

        <div>
          <div className={iconBgClasses}>
            <span className="material-symbols-outlined text-3xl">{icon}</span>
          </div>
          <h3 className={`${isFeatured ? 'text-3xl' : 'text-2xl'} font-bold font-headline text-on-surface mb-2 tracking-tight`}>
            {title}
          </h3>
          <p className="text-on-surface-variant text-sm leading-relaxed max-w-xs">
            {description}
          </p>
          {children}
        </div>

        <div className={isFeatured ? "mt-12" : "mt-8 flex items-center text-primary font-semibold group-hover:gap-2 transition-all"}>
          {isFeatured ? (
            <span className="inline-flex items-center px-6 py-3 bg-primary text-on-primary font-bold rounded-lg shadow-lg group-hover:scale-105 transition-transform">
              {actionLabel}
              <span className="material-symbols-outlined ml-2">{actionIcon}</span>
            </span>
          ) : (
            <>
              <span>{actionLabel}</span>
              <span className="material-symbols-outlined ml-2">{actionIcon}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModeCard;

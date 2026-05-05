import React, { useState } from 'react';
import { useMatchHistory } from './matchHistoryHook';
import matchHistoryModel from './matchHistoryModel';

const RESULT_FILTERS = [
  { key: 'ALL', label: 'All Matches', icon: 'apps' },
  { key: 'WIN', label: 'Victories', icon: 'emoji_events' },
  { key: 'LOSS', label: 'Defeats', icon: 'close' },
  { key: 'DRAW', label: 'Draws', icon: 'handshake' },
];

/* ─── Sub-components ─────────────────────────────────────────── */

/** Search bar with icon */
const SearchBar = ({ value, onChange }) => (
  <div className="relative flex-1 min-w-[220px] max-w-md group">
    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl transition-colors group-focus-within:text-primary">
      search
    </span>
    <input
      id="history-search"
      type="text"
      placeholder="Search by opponent or match ID…"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface-container-high/60 border border-white/5 text-on-surface placeholder:text-on-surface-variant/50 text-sm font-medium outline-none focus:border-primary/40 focus:bg-surface-container-highest/60 transition-all input-glow"
    />
  </div>
);

/** Result filter chip bar */
const FilterChips = ({ active, onChange }) => (
  <div className="flex items-center gap-2 flex-wrap">
    {RESULT_FILTERS.map(f => {
      const isActive = active === f.key;
      return (
        <button
          key={f.key}
          id={`filter-${f.key.toLowerCase()}`}
          onClick={() => onChange(f.key)}
          className={`
            flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider
            border transition-all duration-200 active:scale-95 cursor-pointer
            ${isActive
              ? 'bg-primary/15 border-primary/30 text-primary shadow-[0_0_12px_rgba(179,161,255,0.15)]'
              : 'bg-white/[0.03] border-white/5 text-on-surface-variant hover:bg-white/[0.06] hover:border-white/10'
            }
          `}
        >
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "''" }}>
            {f.icon}
          </span>
          {f.label}
        </button>
      );
    })}
  </div>
);

/** Sort toggle button */
const SortToggle = ({ order, onChange }) => (
  <button
    id="sort-toggle"
    onClick={() => onChange(order === 'desc' ? 'asc' : 'desc')}
    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-on-surface-variant text-xs font-bold uppercase tracking-wider hover:bg-white/[0.06] hover:border-white/10 transition-all active:scale-95 cursor-pointer"
    title={order === 'desc' ? 'Newest first' : 'Oldest first'}
  >
    <span className="material-symbols-outlined text-base transition-transform duration-300" style={{ transform: order === 'asc' ? 'scaleY(-1)' : 'none' }}>
      sort
    </span>
    {order === 'desc' ? 'Newest' : 'Oldest'}
  </button>
);

/** Single match card row */
const MatchRow = ({ match, index }) => {
  const theme = matchHistoryModel.getResultTheme(match.result);
  const gameLabel = matchHistoryModel.getGameTypeLabel(match.gameType);
  const gameIcon = matchHistoryModel.getGameTypeIcon(match.gameType);

  const formattedDate = new Date(match.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = new Date(match.date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className="group relative flex items-center gap-4 md:gap-6 p-4 md:p-5 rounded-2xl bg-surface-container-high/40 border border-white/[0.04] hover:border-white/10 hover:bg-surface-container-highest/50 transition-all duration-300"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Result indicator strip */}
      <div className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-full ${theme.text.replace('text-', 'bg-')} opacity-60 group-hover:opacity-100 transition-opacity`} />

      {/* Result icon badge */}
      <div className={`relative flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center ${theme.bg} border ${theme.border} transition-all group-hover:scale-105`}>
        <span className={`material-symbols-outlined text-2xl md:text-3xl ${theme.text}`} style={{ fontVariationSettings: "'FILL' 1" }}>
          {theme.icon}
        </span>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-base md:text-lg text-on-surface truncate">
            vs {match.opponent}
          </h3>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${theme.bg} ${theme.text} border ${theme.border}`}>
            {theme.label}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-on-surface-variant">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">{gameIcon}</span>
            {gameLabel}
          </span>
          <span className="w-1 h-1 rounded-full bg-outline-variant" />
          <span>{match.boardSize}×{match.boardSize}</span>
          <span className="w-1 h-1 rounded-full bg-outline-variant" />
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">schedule</span>
            {formattedDate}
          </span>
        </div>
      </div>

      {/* Right side — Time & ID */}
      <div className="hidden md:flex flex-col items-end gap-1 flex-shrink-0">
        <span className="text-xs text-on-surface-variant">{formattedTime}</span>
        <span className="text-[10px] font-mono text-primary/60 tracking-wide">
          #{match.id?.slice(-8)?.toUpperCase()}
        </span>
      </div>

      {/* Hover glow effect */}
      <div className={`absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${theme.bg} blur-xl -z-10`} />
    </div>
  );
};

/** Pagination controls */
const Pagination = ({ pagination, page, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { totalPages, totalItems, hasNextPage, hasPreviousPage } = pagination;

  // Build page numbers array
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/5">
      <p className="text-xs text-on-surface-variant">
        Showing <span className="text-on-surface font-semibold">{(page - 1) * 10 + 1}–{Math.min(page * 10, totalItems)}</span> of <span className="text-on-surface font-semibold">{totalItems}</span> battles
      </p>

      <div className="flex items-center gap-1.5">
        <button
          id="page-prev"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPreviousPage}
          className="p-2 rounded-lg border border-white/5 text-on-surface-variant hover:bg-white/5 hover:text-on-surface disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90 cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">chevron_left</span>
        </button>

        {getPageNumbers().map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-on-surface-variant text-sm">⋯</span>
          ) : (
            <button
              key={p}
              id={`page-${p}`}
              onClick={() => onPageChange(p)}
              className={`
                min-w-[36px] h-9 rounded-lg text-sm font-bold transition-all active:scale-90 cursor-pointer
                ${p === page
                  ? 'bg-primary/20 border border-primary/30 text-primary shadow-[0_0_10px_rgba(179,161,255,0.15)]'
                  : 'border border-white/5 text-on-surface-variant hover:bg-white/5 hover:text-on-surface'
                }
              `}
            >
              {p}
            </button>
          )
        )}

        <button
          id="page-next"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className="p-2 rounded-lg border border-white/5 text-on-surface-variant hover:bg-white/5 hover:text-on-surface disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90 cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">chevron_right</span>
        </button>
      </div>
    </div>
  );
};

/** Empty state illustration */
const EmptyState = ({ hasFilters }) => (
  <div className="flex flex-col items-center justify-center py-20 md:py-28 text-center">
    <div className="w-24 h-24 rounded-3xl bg-white/[0.03] border border-dashed border-white/10 flex items-center justify-center mb-6">
      <span className="material-symbols-outlined text-5xl text-on-surface-variant/40">
        {hasFilters ? 'filter_alt_off' : 'sports_esports'}
      </span>
    </div>
    <h3 className="text-xl font-bold headline-font text-on-surface mb-2">
      {hasFilters ? 'No Matches Found' : 'No Battles Yet'}
    </h3>
    <p className="text-on-surface-variant max-w-sm text-sm leading-relaxed">
      {hasFilters
        ? 'Try adjusting your search or filter criteria to find matches.'
        : 'Your battle log is empty. Start your first match and build your legacy!'}
    </p>
  </div>
);

/** Loading skeleton */
const LoadingSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-4 md:gap-6 p-4 md:p-5 rounded-2xl bg-surface-container-high/30 border border-white/[0.03] animate-pulse"
        style={{ animationDelay: `${i * 100}ms` }}
      >
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/5" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-40 rounded-md bg-white/5" />
          <div className="h-3 w-56 rounded-md bg-white/[0.03]" />
        </div>
        <div className="hidden md:flex flex-col gap-1 items-end">
          <div className="h-3 w-16 rounded bg-white/5" />
          <div className="h-3 w-20 rounded bg-white/[0.03]" />
        </div>
      </div>
    ))}
  </div>
);

/** Stats summary bar at the top */
const QuickStats = ({ history, pagination }) => {
  const total = pagination?.totalItems || history.length;
  const wins = history.filter(m => m.result === 'WIN').length;
  const losses = history.filter(m => m.result === 'LOSS').length;
  const draws = history.filter(m => m.result === 'DRAW').length;

  const stats = [
    { label: 'Total', value: total, icon: 'bar_chart', color: 'text-primary' },
    { label: 'Wins', value: wins, icon: 'emoji_events', color: 'text-emerald-400' },
    { label: 'Losses', value: losses, icon: 'close', color: 'text-rose-400' },
    { label: 'Draws', value: draws, icon: 'handshake', color: 'text-amber-400' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {stats.map(s => (
        <div
          key={s.label}
          className="relative overflow-hidden p-4 md:p-5 rounded-2xl bg-surface-container-high/40 border border-white/[0.04] group hover:border-white/10 transition-all"
        >
          <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className={`material-symbols-outlined text-4xl ${s.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
              {s.icon}
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">{s.label}</span>
          <p className={`text-2xl md:text-3xl font-extrabold headline-font mt-1 ${s.color}`}>{s.value}</p>
        </div>
      ))}
    </div>
  );
};


/* ─── Main View ──────────────────────────────────────────────── */

const MatchHistoryView = () => {
  const {
    history, loading, error, pagination, page,
    search, resultFilter, sortOrder,
    setSearch, setResultFilter, setSortOrder, goToPage, refresh
  } = useMatchHistory();

  const hasFilters = search || resultFilter !== 'ALL';

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary/30">


      <main className="pt-28 md:pt-32 pb-32 px-4 md:px-8 max-w-6xl mx-auto space-y-8">

        {/* Page Header */}
        <header className="relative">
          <div className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                history
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest">
                Battle Log
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold headline-font tracking-tight text-on-surface">
              Match History
            </h1>
            <p className="text-on-surface-variant mt-2 text-sm md:text-base max-w-lg">
              Revisit every battle. Analyze your strategies. Forge your path to victory.
            </p>
          </div>
        </header>

        {/* Quick Stats */}
        <QuickStats history={history} pagination={pagination} />

        {/* Toolbar: Search + Filter + Sort */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <SearchBar value={search} onChange={setSearch} />
            <SortToggle order={sortOrder} onChange={setSortOrder} />
          </div>
          <FilterChips active={resultFilter} onChange={setResultFilter} />
        </section>

        {/* Match List */}
        <section className="space-y-3">
          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="material-symbols-outlined text-5xl text-rose-400/60 mb-4">error</span>
              <h3 className="text-lg font-bold text-on-surface mb-1">Something went wrong</h3>
              <p className="text-on-surface-variant text-sm mb-4">{error}</p>
              <button
                onClick={refresh}
                className="px-6 py-2.5 rounded-xl bg-primary/15 border border-primary/20 text-primary text-sm font-bold hover:bg-primary/25 transition-all active:scale-95 cursor-pointer"
              >
                Try Again
              </button>
            </div>
          ) : history.length === 0 ? (
            <EmptyState hasFilters={hasFilters} />
          ) : (
            history.map((match, i) => (
              <MatchRow key={match.id} match={match} index={i} />
            ))
          )}
        </section>

        {/* Pagination */}
        {!loading && !error && (
          <Pagination pagination={pagination} page={page} onPageChange={goToPage} />
        )}
      </main>
    </div>
  );
};

export default MatchHistoryView;

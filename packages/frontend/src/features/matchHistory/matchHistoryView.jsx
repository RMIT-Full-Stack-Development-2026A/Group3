import { Search, ArrowUpDown, RefreshCcw, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Navigation } from '../../components/Navigation.jsx';
import { Card } from '../../components/Card.jsx';
import { Badge } from '../../components/Badge.jsx';
import { Button } from '../../components/Button.jsx';
import { useMatchHistoryLogic } from './useMatchHistoryLogic.js';

const RESULT_OPTIONS = ['ALL', 'WIN', 'LOSS', 'DRAW'];

const toDateTimeLabel = (value) => {
  if (!value) {
    return 'Unknown';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  return date.toLocaleString();
};

const toResultBadgeVariant = (result) => {
  if (result === 'WIN') {
    return 'success';
  }

  if (result === 'LOSS') {
    return 'danger';
  }

  return 'secondary';
};

const toMatchCode = (matchId) => {
  if (!matchId) {
    return 'N/A';
  }

  return `#${matchId.slice(-8).toUpperCase()}`;
};

export default function MatchHistoryView() {
  const {
    rows,
    loading,
    error,
    page,
    setPage,
    searchInput,
    setSearchInput,
    filters,
    setResultFilter,
    setDateFromFilter,
    setDateToFilter,
    toggleSortOrder,
    resetFilters,
    refresh,
    summary
  } = useMatchHistoryLogic();

  return (
    <div className="min-h-screen bg-page pb-24 text-text-primary">
      <Navigation />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <section className="mb-8 rounded-2xl border border-border bg-surface p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-text-secondary">Arena Records</p>
              <h1 className="mt-2 text-3xl font-orbitron md:text-4xl">Match History</h1>
              <p className="mt-2 text-text-secondary">Search, filter, and sort your completed battles.</p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={refresh} className="gap-2">
                <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
                Refresh
              </Button>
              <Button variant="outline" onClick={resetFilters} className="gap-2">
                <RotateCcw size={16} />
                Reset
              </Button>
            </div>
          </div>
        </section>

        <section className="mb-6 grid gap-3 rounded-2xl border border-border bg-surface p-4 md:grid-cols-6">
          <div className="relative md:col-span-2">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by opponent or match id"
              className="h-11 w-full rounded-lg border border-border bg-page pl-10 pr-3 text-sm text-text-primary outline-none focus:border-gold"
            />
          </div>

          <select
            value={filters.result}
            onChange={(event) => setResultFilter(event.target.value)}
            className="h-11 rounded-lg border border-border bg-page px-3 text-sm text-text-primary outline-none focus:border-gold"
          >
            {RESULT_OPTIONS.map((result) => (
              <option key={result} value={result}>
                {result}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={filters.dateFrom}
            onChange={(event) => setDateFromFilter(event.target.value)}
            className="h-11 rounded-lg border border-border bg-page px-3 text-sm text-text-primary outline-none focus:border-gold"
          />

          <input
            type="date"
            value={filters.dateTo}
            onChange={(event) => setDateToFilter(event.target.value)}
            className="h-11 rounded-lg border border-border bg-page px-3 text-sm text-text-primary outline-none focus:border-gold"
          />

          <Button variant="outline" onClick={toggleSortOrder} className="h-11 w-full gap-2">
            <ArrowUpDown size={16} />
            {filters.sortOrder === 'desc' ? 'Newest' : 'Oldest'}
          </Button>
        </section>

        {error && (
          <Card className="mb-6 border-coral/40 bg-coral/10 p-4 text-sm text-coral">
            {error}
          </Card>
        )}

        <section className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-surface-elevated/50 text-xs uppercase tracking-wider text-text-secondary">
                  <th className="px-5 py-4">Match ID</th>
                  <th className="px-5 py-4">Opponent</th>
                  <th className="px-5 py-4">Result</th>
                  <th className="px-5 py-4">Mode</th>
                  <th className="px-5 py-4">Board</th>
                  <th className="px-5 py-4">Played At</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? [1, 2, 3, 4, 5].map((skeletonRow) => (
                      <tr key={skeletonRow} className="border-b border-border/70">
                        <td colSpan={6} className="px-5 py-4">
                          <div className="h-7 w-full animate-pulse rounded bg-page/70" />
                        </td>
                      </tr>
                    ))
                  : rows.map((row) => (
                      <tr key={row.id} className="border-b border-border/70 text-sm hover:bg-page/40">
                        <td className="px-5 py-4 font-mono text-text-secondary">{toMatchCode(row.matchId)}</td>
                        <td className="px-5 py-4 font-medium text-text-primary">{row.opponentName}</td>
                        <td className="px-5 py-4">
                          <Badge variant={toResultBadgeVariant(row.result)}>{row.result}</Badge>
                        </td>
                        <td className="px-5 py-4 text-text-secondary">{row.gameType}</td>
                        <td className="px-5 py-4 text-text-secondary">{row.boardSize}x{row.boardSize}</td>
                        <td className="px-5 py-4 text-text-secondary">{toDateTimeLabel(row.playedAt)}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {!loading && rows.length === 0 && (
            <Card className="m-4 border-dashed p-8 text-center text-text-secondary">
              No matches found for current filters.
            </Card>
          )}
        </section>

        <section className="mt-5 flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-text-secondary">
            Showing {summary.start}-{summary.end} of {summary.totalItems}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={!summary.hasPreviousPage}
              className="gap-2"
            >
              <ChevronLeft size={16} />
              Previous
            </Button>

            <span className="rounded-lg border border-border px-3 py-2 text-sm text-text-secondary">
              Page {page}{summary.totalPages > 0 ? ` / ${summary.totalPages}` : ''}
            </span>

            <Button
              variant="outline"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={!summary.hasNextPage}
              className="gap-2"
            >
              Next
              <ChevronRight size={16} />
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}

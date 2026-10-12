import { useNavigate } from 'react-router-dom';
import { useArenaRooms } from './arenaHook';
import { useAuthStore } from '../../app/store/authStore';
import { useState } from 'react';
import { Users, Hexagon, GameController, Funnel, Plus, User, ArrowRight } from '@phosphor-icons/react';
import GameSetupModal from '../game/components/GameSetupModal';

function RoomCard({ room, featured = false, onJoin, isOwner = false }) {
  const playerCount = room.status === 'WAITING' ? 1 : 2;
  const roomLabel = room.roomCode ? `Room ${room.roomCode}` : 'Room';
  const hostLabel = room.player1Name || 'Unknown host';

  if (featured) {
    return (
      <article className="col-span-1 md:col-span-2 rounded-[1.25rem] border border-volt/20 bg-[rgba(18,15,23,0.6)] p-6 backdrop-blur-2xl relative overflow-hidden group shadow-[0_12px_40px_rgba(0,0,0,0.25)]">
        <div className="absolute top-0 right-0 p-4">
          <span className="rounded-full border border-volt/30 bg-volt/20 px-2 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-volt">
            High Stakes
          </span>
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="relative h-24 w-24 shrink-0">
            <div className="absolute inset-0 rounded-full bg-volt/20 blur-xl" aria-hidden="true" />
            <div className="relative z-10 flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-volt/40 bg-surface-container-highest">
              <GameController size={40} weight="bold" aria-hidden="true" className="text-volt" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="mb-1 text-2xl font-headline font-bold text-on-surface break-words">{roomLabel}</h3>
            <div className="flex flex-wrap gap-4 text-sm text-on-surface-variant">
              <div className="flex items-center gap-1.5">
                <Users size={16} weight="bold" aria-hidden="true" />
                <span>{playerCount}/2 Players</span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-volt/80">Host:</span>
              <span className="text-sm font-medium text-on-surface break-words">{hostLabel}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onJoin(room.roomCode)}
            disabled={isOwner}
            className="self-start inline-flex items-center gap-2 rounded-lg bg-volt px-8 py-3 font-bold text-volt-ink transition-all hover:shadow-[0_0_15px_rgba(195,255,74,0.4)] active:scale-[0.98] md:self-center disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            {isOwner ? 'Your Room' : 'Join Room'}
            {!isOwner && <ArrowRight size={18} weight="bold" aria-hidden="true" />}
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-xl border border-outline-variant/10 bg-surface-container-high p-5 transition-all group hover:border-volt/30">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-container-highest">
            <Hexagon size={20} weight="bold" aria-hidden="true" className="text-volt" />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-on-surface truncate">{roomLabel}</h4>
            <span className="text-xs text-on-surface-variant truncate block">Host: {hostLabel}</span>
          </div>
        </div>
        <span className="text-sm font-bold tracking-tighter text-volt shrink-0">{room.status === 'WAITING' ? 'OPEN' : room.status}</span>
      </div>

      <div className="flex items-center justify-between mt-6">
        <div className="flex -space-x-2" aria-hidden="true">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-surface-container-highest">
            <User size={14} weight="bold" />
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-surface-container-highest/50">
            <Plus size={14} weight="bold" className="text-on-surface-variant" />
          </div>
        </div>

        <button
          type="button"
          onClick={() => onJoin(room.roomCode)}
          disabled={isOwner}
          className="inline-flex items-center gap-1.5 rounded-lg bg-volt px-6 py-2 text-sm font-bold text-volt-ink transition-all hover:shadow-[0_0_12px_rgba(195,255,74,0.35)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          {isOwner ? 'Your Room' : 'Join Room'}
          {!isOwner && <ArrowRight size={14} weight="bold" aria-hidden="true" />}
        </button>
      </div>
    </article>
  );
}

export default function ArenaView() {
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const { user } = useAuthStore();
  const {
    rooms,
    loading,
    error,
    joinCode,
    setJoinCode,
    submitting,
    createRoom,
    joinRoom
  } = useArenaRooms();

  const featuredRoom = rooms[0] || null;
  const secondaryRooms = rooms.slice(1);
  const hasCreatedRoom = !!rooms.find(r => String(r.player1Id) === String(user?.id) && r.status === 'WAITING');

  const handleCreateRoomClick = () => {
    if (hasCreatedRoom || submitting) return;
    setIsSetupOpen(true);
  };

  const handleCreateOnlineRoom = async (setupConfig) => {
    await createRoom(setupConfig);
  };

  return (
    <main className="min-h-screen bg-surface text-on-surface font-body selection:bg-volt selection:text-volt-ink px-6 pb-40 pt-20 md:pt-28">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="space-y-8">
          <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="mb-2 font-headline text-4xl md:text-5xl font-black tracking-tighter text-on-surface">
                Active Rooms
              </h1>
              <p className="font-medium text-on-surface-variant">Join a match or create your own room.</p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg border border-outline-variant/20 bg-surface-container-high px-6 py-3 font-bold transition-colors hover:bg-surface-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt/60"
              >
                <Funnel size={16} weight="bold" aria-hidden="true" />
                <span>Filter</span>
              </button>
              <button
                type="button"
                onClick={handleCreateRoomClick}
                disabled={submitting || hasCreatedRoom}
                className="flex items-center gap-2 rounded-lg bg-volt px-6 py-3 font-extrabold text-volt-ink shadow-lg shadow-volt/10 transition-transform hover:scale-105 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                <Plus size={18} weight="bold" aria-hidden="true" />
                <span>{hasCreatedRoom ? 'Room Created' : (submitting ? 'Creating…' : 'Create Room')}</span>
              </button>
            </div>
          </header>

          <div className="grid gap-4 lg:grid-cols-[1fr_360px] lg:items-start">
            <div className="order-2 space-y-4 lg:order-1">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {loading ? (
                  <div className="col-span-1 md:col-span-2 grid gap-4 md:grid-cols-2">
                    <div className="col-span-1 md:col-span-2 h-56 animate-pulse rounded-xl border border-volt/20 bg-white/5" />
                    <div className="h-44 animate-pulse rounded-xl bg-white/3" />
                    <div className="h-44 animate-pulse rounded-xl bg-white/3" />
                    <div className="h-44 animate-pulse rounded-xl bg-white/3" />
                    <div className="h-44 animate-pulse rounded-xl bg-white/3" />
                  </div>
                ) : rooms.length === 0 ? (
                  <div className="col-span-1 md:col-span-2 rounded-xl border border-dashed border-white/10 bg-surface-container-high/40 p-10 text-center text-on-surface-variant">
                    No waiting rooms right now. Create one and invite someone in.
                  </div>
                ) : (
                  <>
                    <RoomCard room={featuredRoom} featured onJoin={joinRoom} isOwner={String(featuredRoom?.player1Id) === String(user?.id)} />
                    {secondaryRooms.map((room) => (
                      <RoomCard key={room._id || room.roomCode} room={room} onJoin={joinRoom} isOwner={String(room.player1Id) === String(user?.id)} />
                    ))}
                  </>
                )}
              </div>
            </div>
            <aside className="order-1 glass-panel rounded-xl border border-outline-variant/20 p-6 lg:order-2 lg:sticky lg:top-28">
              <h2 id="join-by-code-heading" className="text-2xl font-headline font-bold text-on-surface">Join by code</h2>
              <p className="mt-2 text-sm font-medium text-on-surface-variant">Enter the 4-digit room PIN.</p>

              <div className="mt-5 flex gap-3">
                <label htmlFor="join-code-input" className="sr-only">Room code</label>
                <input
                  id="join-code-input"
                  name="joinCode"
                  value={joinCode}
                  onChange={(event) => setJoinCode(event.target.value.replace(/\D/g, '').slice(0, 4))}
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="1234"
                  aria-describedby="join-by-code-heading"
                  className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-highest/60 px-4 py-3 text-lg tracking-[0.4em] text-on-surface outline-none transition-all focus:border-volt focus-visible:ring-2 focus-visible:ring-volt/40"
                />
                <button
                  type="button"
                  onClick={() => joinRoom(joinCode)}
                  disabled={submitting || joinCode.length !== 4}
                  className="rounded-xl bg-on-surface px-4 py-3 font-semibold text-surface transition-opacity disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                >
                  Join
                </button>
              </div>
              {error && <p role="alert" aria-live="polite" className="mt-4 text-sm font-medium text-rose-400">{error}</p>}
            </aside>
          </div>
        </section>
      </div>

      <GameSetupModal
        isOpen={isSetupOpen}
        mode="ONLINE"
        onClose={() => setIsSetupOpen(false)}
        onStartOnline={handleCreateOnlineRoom}
      />
    </main>
  );
}

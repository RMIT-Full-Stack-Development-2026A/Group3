import { useNavigate } from 'react-router-dom';
import { useArenaRooms } from './arenaHook';
import { useAuthStore } from '../../app/store/authStore';
import { useState } from 'react';
import GameSetupModal from '../game/components/GameSetupModal';

function MaterialIcon({ name, filled = false, className = '' }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0" }}
    >
      {name}
    </span>
  );
}

function RoomCard({ room, featured = false, onJoin, isOwner = false }) {
  const playerCount = room.status === 'WAITING' ? 1 : 2;

  if (featured) {
    return (
      <article className="col-span-1 md:col-span-2 rounded-[1.25rem] border border-primary/20 bg-[rgba(40,33,62,0.4)] p-6 backdrop-blur-2xl relative overflow-hidden group shadow-[0_12px_40px_rgba(0,0,0,0.25)]">
        <div className="absolute top-0 right-0 p-4">
          <span className="rounded-full border border-primary/30 bg-primary/20 px-2 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
            High Stakes
          </span>
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="relative h-24 w-24 shrink-0">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl" />
            <div className="relative z-10 flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-primary/40 bg-surface-container-highest">
              <MaterialIcon name="sports_esports" className="text-5xl text-primary" />
            </div>
          </div>

          <div className="flex-1">
            <h3 className="mb-1 text-2xl font-headline font-bold text-on-surface">{room.roomCode ? `Room ${room.roomCode}` : 'Cyber-Zenith Pavilion'}</h3>
            <div className="flex flex-wrap gap-4 text-sm text-on-surface-variant">
              <div className="flex items-center gap-1.5">
                <MaterialIcon name="group" className="text-sm" />
                <span>{playerCount}/2 Players</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MaterialIcon name="token" filled className="text-sm text-primary" />
                <span className="font-bold text-primary">500 TOANG</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MaterialIcon name="timer" className="text-sm" />
                <span>15s Move</span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-violet-400">Waiting for Opponent:</span>
              <span className="text-sm font-medium text-on-surface">{room.player1Name || 'Zephyr_Gamer_99'}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onJoin(room.roomCode)}
            disabled={isOwner}
            className="self-start rounded-lg bg-white px-8 py-3 font-black text-surface transition-all hover:bg-primary hover:text-on-primary md:self-center disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isOwner ? 'Your Room' : 'JOIN'}
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-xl border border-outline-variant/10 bg-surface-container-high p-5 transition-all group hover:border-primary/30">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-surface-container-highest">
            <MaterialIcon name="hexagon" className="text-lg text-primary" />
          </div>
          <div>
            <h4 className="font-bold text-on-surface">{room.roomCode}</h4>
            <span className="text-xs text-on-surface-variant">Host: {room.player1Name}</span>
          </div>
        </div>
        <span className="text-sm font-bold tracking-tighter text-primary">{room.status === 'WAITING' ? 'OPEN' : room.status}</span>
      </div>

      <div className="flex items-center justify-between mt-6">
        <div className="flex -space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-surface-container-highest">
            <MaterialIcon name="person" className="text-xs" />
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-surface-container-highest/50">
            <MaterialIcon name="add" className="text-xs text-on-surface-variant" />
          </div>
        </div>

        <button
          type="button"
          onClick={() => onJoin(room.roomCode)}
          disabled={isOwner}
          className="rounded-lg bg-surface-bright px-6 py-2 text-sm font-bold transition-all hover:bg-primary-container hover:text-on-primary-container disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isOwner ? 'Your Room' : 'Challenge'}
        </button>
      </div>
    </article>
  );
}

export default function ArenaView() {
  const navigate = useNavigate();
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const { user } = useAuthStore();
  const { logout } = useAuthStore();
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCreateRoomClick = () => {
    if (hasCreatedRoom || submitting) return;
    setIsSetupOpen(true);
  };

  const handleCreateOnlineRoom = async (setupConfig) => {
    await createRoom(setupConfig);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary/30">
      <header className="fixed top-0 z-50 flex w-full items-center justify-between bg-slate-950/40 px-8 py-4 shadow-[0_8px_32px_0_rgba(16,11,31,0.4)] backdrop-blur-xl">
        <div className="flex items-center gap-8">
          <h1 className="bg-linear-to-br from-indigo-300 to-purple-500 bg-clip-text font-headline text-2xl font-bold tracking-tight text-transparent">
            TicTacToang
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button className="h-10 w-10 overflow-hidden rounded-full border-2 border-primary/30 transition-colors hover:border-primary active:scale-95">
            <img
              alt="User Avatar"
              className="h-full w-full object-cover"
              src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'player'}`}
            />
          </button>

          <button
            type="button"
            onClick={handleCreateRoomClick}
            disabled={submitting || hasCreatedRoom}
            className="rounded-lg bg-linear-to-br from-primary to-primary-container px-5 py-2 text-sm font-bold text-on-primary transition-all active:scale-95 hover:shadow-[0_0_15px_rgba(179,161,255,0.3)] disabled:opacity-60"
          >
            {hasCreatedRoom ? 'Room Created' : (submitting ? 'Creating...' : 'Create Room')}
          </button>

          <button type="button" onClick={handleLogout} className="p-2 text-slate-400 transition-colors hover:text-error">
            <MaterialIcon name="logout" />
          </button>
        </div>
      </header>

      <main className="hero-gradient min-h-screen px-6 pb-12 pt-24 md:pt-28">
        <div className="mx-auto max-w-5xl space-y-8">
          <section className="space-y-8">
            <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h1 className="mb-2 font-headline text-5xl font-black tracking-tighter text-on-surface md:text-6xl">
                  Active Rooms
                </h1>
                <p className="font-medium text-on-surface-variant">Join a match or create your own ethereal challenge.</p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg border border-outline-variant/20 bg-surface-container-high px-6 py-3 font-bold transition-colors hover:bg-surface-bright"
                >
                  <MaterialIcon name="filter_list" className="text-sm" />
                  <span>Filter</span>
                </button>
                <button
                  type="button"
                  onClick={handleCreateRoomClick}
                  disabled={submitting || hasCreatedRoom}
                  className="flex items-center gap-2 rounded-lg bg-linear-to-br from-primary to-primary-container px-6 py-3 font-extrabold text-on-primary shadow-lg shadow-primary/20 transition-transform hover:scale-105 disabled:opacity-60"
                >
                  <MaterialIcon name="add" />
                  <span>{hasCreatedRoom ? 'Room Created' : (submitting ? 'Creating...' : 'Create Room')}</span>
                </button>
              </div>
            </header>

            <div className="grid gap-4 lg:grid-cols-[1fr_360px] lg:items-start">
              <div className="order-2 space-y-4 lg:order-1">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {loading ? (
                    <div className="col-span-1 md:col-span-2 grid gap-4 md:grid-cols-2">
                      <div className="col-span-1 md:col-span-2 h-56 animate-pulse rounded-xl border border-primary/20 bg-white/5" />
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
                <h2 className="text-2xl font-headline font-bold text-on-surface">Join by code</h2>
                <p className="mt-2 text-sm font-medium text-on-surface-variant">Enter the 4-digit room PIN.</p>

                <div className="mt-5 flex gap-3">
                  <input
                    value={joinCode}
                    onChange={(event) => setJoinCode(event.target.value.replace(/\D/g, '').slice(0, 4))}
                    inputMode="numeric"
                    placeholder="1234"
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-highest/60 px-4 py-3 text-lg tracking-[0.4em] text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => joinRoom(joinCode)}
                    disabled={submitting || joinCode.length !== 4}
                    className="rounded-xl bg-on-surface px-4 py-3 font-semibold text-surface transition-opacity disabled:opacity-50"
                  >
                    Join
                  </button>
                </div>
                {error && <p className="mt-4 text-sm font-medium text-rose-400">{error}</p>}
              </aside>
            </div>
          </section>
        </div>
      </main>
      

      <div className="fixed bottom-6 left-6 right-6 z-50 md:hidden">
        <div className="flex items-center justify-around rounded-2xl border border-white/10 bg-surface-bright/50 p-3 shadow-2xl backdrop-blur-3xl">
          <button className="flex flex-col items-center gap-1 text-primary">
            <MaterialIcon name="grid_view" filled />
            <span className="text-[10px] font-bold uppercase tracking-widest">Lobby</span>
          </button>

          <button className="flex flex-col items-center gap-1 text-on-surface-variant">
            <MaterialIcon name="leaderboard" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Rank</span>
          </button>

          <button
            type="button"
            onClick={handleCreateRoomClick}
            disabled={submitting || hasCreatedRoom}
            className="relative -top-8 flex h-14 w-14 items-center justify-center rounded-full border-4 border-surface bg-linear-to-br from-primary to-primary-container text-on-primary shadow-xl shadow-primary/40 disabled:opacity-60"
          >
            <MaterialIcon name="add" className="text-3xl" />
          </button>

          <button className="flex flex-col items-center gap-1 text-on-surface-variant">
            <MaterialIcon name="chat" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Chat</span>
          </button>

          <button className="flex flex-col items-center gap-1 text-on-surface-variant" onClick={handleLogout}>
            <MaterialIcon name="person" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Profile</span>
          </button>
        </div>
      </div>

      <GameSetupModal
        isOpen={isSetupOpen}
        mode="ONLINE"
        onClose={() => setIsSetupOpen(false)}
        onStartOnline={handleCreateOnlineRoom}
      />
    </div>
  );
}

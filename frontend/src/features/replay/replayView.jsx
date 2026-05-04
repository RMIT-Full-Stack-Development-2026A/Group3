import './replay.css';
import { useReplayLogic } from './useReplayLogic';

export const ReplayView = () => {
  const {
    gameIdInput,
    setGameIdInput,
    tokenInput,
    setTokenInput,
    session,
    board,
    currentMove,
    totalMoves,
    isPaused,
    isLoading,
    error,
    loadReplay,
    pause,
    resume,
    forward,
    backward
  } = useReplayLogic();

  return (
    <div className="replay-container">
      <h1>Replay Test View</h1>

      <div className="replay-inputs">
        <input
          type="text"
          placeholder="Enter game ID"
          value={gameIdInput}
          onChange={(event) => setGameIdInput(event.target.value)}
        />
        <input
          type="text"
          placeholder="Enter bearer token (for testing)"
          value={tokenInput}
          onChange={(event) => setTokenInput(event.target.value)}
        />
        <button onClick={loadReplay} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Load Replay'}
        </button>
      </div>

      {error ? <p className="replay-error">{error}</p> : null}

      <p className="replay-status">
        Move {currentMove} of {totalMoves}
      </p>

      <div className="replay-controls">
        <button onClick={backward} disabled={currentMove === 0}>
          Backward
        </button>
        <button onClick={pause} disabled={isPaused || totalMoves === 0}>
          Pause
        </button>
        <button onClick={resume} disabled={!isPaused || currentMove >= totalMoves}>
          Resume
        </button>
        <button onClick={forward} disabled={currentMove >= totalMoves}>
          Forward
        </button>
      </div>

      <div className="replay-board">
        {board.map((row, rowIndex) => (
          <div className="replay-row" key={`row-${rowIndex}`}>
            {row.map((cell, colIndex) => (
              <div className="replay-cell" key={`cell-${rowIndex}-${colIndex}`}>
                {cell || ''}
              </div>
            ))}
          </div>
        ))}
      </div>

      {session ? (
        <p className="replay-meta">
          Session: {session.id} | Type: {session.gameType} | Status: {session.status}
        </p>
      ) : null}
    </div>
  );
};

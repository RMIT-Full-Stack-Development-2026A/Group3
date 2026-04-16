/**
 * Game DTO - Data Transfer Object
 * Handles request validation and response filtering for the Game module
 */
const parsePositiveInteger = (value, fallbackValue) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallbackValue;
};

const parseDateValue = (value, fieldName) => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${fieldName} must be a valid date value`);
  }

  return parsed;
};

const ALLOWED_HISTORY_RESULTS = new Set(['ALL', 'WIN', 'LOSS', 'DRAW']);
const ALLOWED_SYNC_RESULTS = new Set(['WIN', 'LOSS', 'DRAW']);

const GameDTO = {
  /**
   * Request DTO: Validate and transform move input
   */
  toMoveRequest: (body) => {
    const { row, col, marker } = body;
    if (row === undefined || col === undefined || !marker) {
      throw new Error('Invalid move coordinates or marker');
    }
    return {
      row: parseInt(row),
      col: parseInt(col),
      marker: marker.toUpperCase()
    };
  },

  /**
   * Request DTO: Capture the full offline match result after it ends
   */
  toSyncLocalRequest: (body) => {
    const { gameType, boardSize, p1Id, p1Name, p2Name, winnerId, winLine, moves, result } = body;
    if (!moves || !Array.isArray(moves)) {
      throw new Error('Moves history must be a valid array');
    }

    const normalizedResult = typeof result === 'string'
      ? result.toUpperCase()
      : winnerId
        ? 'WIN'
        : 'DRAW';

    const status = ALLOWED_SYNC_RESULTS.has(normalizedResult)
      ? normalizedResult
      : 'DRAW';

    return {
      gameType: gameType || 'LOCAL',
      boardSize: boardSize === 15 ? 15 : 10,
      player1Id: p1Id,
      player1Name: p1Name || 'Player 1',
      player2Name: p2Name || 'Player 2',
      status,
      winnerId: winnerId || null,
      winLine: winLine || [],
      moves: moves.map((m, idx) => ({
        step: idx + 1,
        pId: m.pId || null,
        x: m.x,
        y: m.y,
        marker: String(m.marker || '').toUpperCase(),
        time: m.time || new Date()
      }))
    };
  },

  /**
   * Request DTO: Validate and normalize history query params
   */
  toHistoryQuery: (userId, query = {}) => {
    if (!userId) {
      throw new Error('Authenticated user context is required');
    }

    const page = parsePositiveInteger(query.page, 1);
    const limit = Math.min(parsePositiveInteger(query.limit, 10), 50);
    const sortOrder = String(query.sortOrder || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';
    const search = typeof query.search === 'string' ? query.search.trim() : '';
    const historyResult = String(query.result || 'ALL').toUpperCase();

    if (!ALLOWED_HISTORY_RESULTS.has(historyResult)) {
      throw new Error('result must be one of ALL, WIN, LOSS, DRAW');
    }

    const date = parseDateValue(query.date, 'date');
    const dateFrom = parseDateValue(query.dateFrom, 'dateFrom');
    const dateTo = parseDateValue(query.dateTo, 'dateTo');

    return {
      userId,
      page,
      limit,
      search,
      result: historyResult,
      date,
      dateFrom,
      dateTo,
      sortOrder
    };
  },

  /**
   * Response DTO: Shape match-history items for frontend use
   */
  toHistoryResponse: (payload) => {
    return {
      items: (payload.items || []).map((item) => ({
        id: item.matchId,
        matchId: item.matchId,
        gameType: item.gameType,
        boardSize: item.boardSize,
        status: item.status,
        opponentName: item.opponentName,
        result: item.result,
        playedAt: item.playedAt
      })),
      pagination: payload.pagination || null
    };
  },

  /**
   * Response DTO: Filter game session for the client
   */
  toGameResponse: (game) => {
    return {
      id: game._id,
      gameType: game.gameType,
      status: game.status,
      board: game.boardState,
      winnerId: game.winnerId,
      winLine: game.winLine || [],
      isReplayable: (game.gameType === 'ONLINE' || game.gameType === 'LOCAL' || (game.gameType === 'SINGLE' && game.difficulty === 'HARD'))
    };
  }
};

export default GameDTO;

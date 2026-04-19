const parsePositiveInteger = (value, fallbackValue) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallbackValue;
};

const parseDateValue = (value, fieldName) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        throw new Error(`${fieldName} must be a valid date value`);
    }
    return parsed;
};

const ALLOWED_HISTORY_RESULTS = new Set(['ALL', 'WIN', 'LOSS', 'DRAW']);



class GameDTO {
    static _calculateOutcome(session, userId) {
        if (session.status === 'ACTIVE') return 'ONGOING';
        if (session.status === 'ABORTED') return 'CANCELLED';
    
        if (!session.winnerId) {
            if (session.winLine && session.winLine.length > 0) return 'LOSS';
            return 'DRAW';
        }
    
        return session.winnerId.toString() === userId?.toString() ? 'WIN' : 'LOSS';
    }

    static toHistoryQuery(userId, query = {}) {
        if (!userId) throw new Error('Authenticated user context is required');

        const page = parsePositiveInteger(query.page, 1);
        const limit = Math.min(parsePositiveInteger(query.limit, 10), 50);
        const sortOrder = String(query.sortOrder || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';
        const search = typeof query.search === 'string' ? query.search.trim() : '';
        const historyResult = String(query.result || 'ALL').toUpperCase();

        if (!ALLOWED_HISTORY_RESULTS.has(historyResult)) {
            throw new Error('result must be one of ALL, WIN, LOSS, DRAW');
        }

        return {
            userId,
            page,
            limit,
            search,
            result: historyResult,
            date: parseDateValue(query.date, 'date'),
            dateFrom: parseDateValue(query.dateFrom, 'dateFrom'),
            dateTo: parseDateValue(query.dateTo, 'dateTo'),
            sortOrder
        };
    }

    static toMoveReq(body) {
        const { row, col, marker } = body;
        if (row === undefined || col === undefined || !marker) {
            throw new Error('Invalid move coordinates or marker');
        }
        return {y: parseInt(row), x: parseInt(col), marker: marker.toUpperCase()};
    }

    static toHistoryRes(payload) {
        return {
            items: (payload.items || []).map((item) => ({
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
    }

    static toGameSession(session, currentUserId) {
        if (!session) return null;
        const serializeId = (val) => val?._id?.toString() || val?.toString() || null;

        return {
            sessionId: session._id.toString(),
            gameType: session.gameType,
            boardSize: session.boardSize,
            difficulty: session.difficulty,
            status: session.status,
            players: {
                p1: {
                    id: serializeId(session.player1Id),
                    name: session.player1Name,
                    avatar: session.player1Avatar,
                    marker: session.player1Marker,
                },
                p2: {
                    id: serializeId(session.player2Id),
                    name: session.player2Name,
                    avatar: session.player2Avatar,
                    marker: session.player2Marker,
                }
            },
            gameState: {
                board: session.boardState,
                currentTurn: session.currentTurn,
                totalMoves: session.moves?.length || 0,
                lastMove: session.moves?.length > 0 ? session.moves[session.moves.length - 1] : null
            },
            result: {
                winnerId: serializeId(session.winnerId),
                winLine: session.winLine || [],
                matchOutcome: this._calculateOutcome(session, currentUserId),
                endTime: session.endTime
            }
        };
    }

    static toLocalReq(body = {}) {
        const { 
            gameType, boardSize, 
            p1Id, p1Name, p1Marker,
            p2Name, p2Marker, 
            winnerId, winLine, moves,
            status: bodyStatus,
            currentTurn,
            boardState 
        } = body;

        if (!moves || !Array.isArray(moves)) {
            throw new Error('Moves history must be a valid array');
        }

        const isP1 = (id) => id === p1Id || id === 'p1-local';
        const sanitizeId = (id) => isP1(id) ? p1Id : null;

        const status = bodyStatus || (winnerId ? 'COMPLETED' : 'DRAW');

        return {
            gameType: gameType,
            boardSize: boardSize === 15 ? 15 : 10,
            
            player1Id: p1Id,
            player1Name: p1Name,
            player1Marker: p1Marker,
            
            player2Name: p2Name,
            player2Marker: p2Marker,

            currentTurn: currentTurn,
            boardState: boardState,

            status: status,
            winnerId: winnerId ? sanitizeId(winnerId) : null,
            winLine: winLine || [],
            
            endTime: new Date(), 

            moves: moves.map((m, idx) => {
                if (m.x === undefined || m.y === undefined) {
                    throw new Error(`Invalid move coordinates at step ${idx + 1}`);
                }
                return {
                    step: idx + 1,
                    pId: sanitizeId(m.pId),
                    x: parseInt(m.x),
                    y: parseInt(m.y),
                    marker: String(m.marker || '').toUpperCase(),
                    time: m.time ? new Date(m.time) : new Date()
                };
            })
        };
    }
}

export default GameDTO;

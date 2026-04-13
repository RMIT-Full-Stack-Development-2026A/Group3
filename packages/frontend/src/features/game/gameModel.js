/**
 * GameModel - Minimalist DTO Layer.
 */
const GameModel = {
    createGameSessionModel: (session, currentUserId) => {
        if (!session) return null;
        
        const players = session.players || {};
        const gameState = session.gameState || {};
        const result = session.result || {};

        // Primary Marker Mapping
        const p1Id = players.p1?.id?.toString();
        const curIdStr = currentUserId?.toString();
        const isPlayer1 = curIdStr === p1Id;

        return {
            id: session.sessionId,
            board: gameState.board,
            boardSize: session.boardSize,
            gameType: session.gameType,
            
            player1Marker: players.p1?.marker || 'CROSS',
            player2Marker: players.p2?.marker || 'CIRCLE',
            
            currentTurn: gameState.currentTurn === 'PLAYER1' ? 'X' : 'O',
            isUserTurn: gameState.currentTurn === (isPlayer1 ? 'PLAYER1' : 'PLAYER2'),
            
            status: session.status,
            winnerMarker: result.winnerId ? (result.winnerId.toString() === p1Id ? 'X' : 'O') : null,
            winLine: result.winLine || [],
            
            p1Name: players.p1?.name || 'You',
            p2Name: players.p2?.name || 'AI'
        };
    }
};

export default GameModel;

import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import gameService from './gameService';
import gameModel from './gameModel';
import { useAuthStore } from '../../app/store/authStore';
import { processLocalMove } from './localGameLogic';
import { getSocket } from '../Arena/arenaHook';
import { getBestMove } from '@tictactoang/shared/utils/aiLogicUtil';

export function useGame(sessionId) {
  const location = useLocation();
  const { user } = useAuthStore();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roomNotice, setRoomNotice] = useState(null);
  
  // Chat state for online games
  const [chatMessages, setChatMessages] = useState([]);
  const resolvedRoomCode = location.state?.roomCode || session?.roomCode || null;
  
  // Local game state history
  const [moves, setMoves] = useState([]);  
  const [isAILocking, setIsAILocking] = useState(false);

  const isNewSession = sessionId === 'new' && location.state?.config;

  const fetchSession = useCallback(async () => {
    if (!sessionId || sessionId === 'new') return;
    try {
      const data = await gameService.getSession(sessionId);
      setSession(gameModel.formatSession(data.data));
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch game session');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (isNewSession && !session) {
      const config = location.state.config;
      const size = config.boardSize || 10;
      
      let initialBoard = Array(size).fill(null).map(() => Array(size).fill(null));
      let currentTurn = config.currentTurn;
      let initialMoves = [];
      
      // If AI mode and AI moves first
      if (config.gameType === 'SINGLE' && config.moveFirst === 'bot') {
        const difficulty = config.difficulty;
        const bestMove = getBestMove(initialBoard, difficulty, config.players.p2.marker, config.players.p1.marker);
        initialBoard[bestMove.row][bestMove.col] = config.players.p2.marker;
        initialMoves.push({
          x: bestMove.col,
          y: bestMove.row,
          marker: config.players.p2.marker,
          pId: null, // AI
          time: new Date()
        });
        currentTurn = 'PLAYER1';
      }

      setSession({
        ...config,
        id: config.gameType === 'SINGLE' ? 'ai-session' : 'local-session',
        board: initialBoard,
        currentTurn: currentTurn,
        p1: { ...config.players.p1, id: user?.id, name: user?.username, avatar: user?.avatarUrl },
        p2: { ...config.players.p2, id: null },
        status: 'ACTIVE'
      });
      setMoves(initialMoves);
      setLoading(false);
      return;
    }

    if (sessionId === 'new') return;

    fetchSession();
  }, [fetchSession, isNewSession, session?.id, session?.status, session?.currentTurn, session?.gameType, sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    const socket = getSocket();
    if (!socket) return;

    if (!socket.connected) {
      const token = useAuthStore.getState().token;
      socket.auth = { token };
      socket.connect();
    }

    // For online games, join the room socket channel
    if (session?.gameType === 'ONLINE' && resolvedRoomCode) {
      socket.emit('join-room', resolvedRoomCode);
    }

    const handleGameMove = (payload) => {
      if (!payload || !payload.session) return;
      const incoming = payload.session;
      if (incoming.sessionId !== sessionId) return;
      setSession(gameModel.formatSession(incoming));
    };

    const handleChatMessage = (messageObj) => {
      // Add incoming chat message to chat messages array
      setChatMessages(prev => [...prev, messageObj]);
    };

    const handleRoomAborted = (payload) => {
      const incomingSessionId = payload?.sessionId?.toString?.() || payload?.sessionId;
      if (incomingSessionId && incomingSessionId !== sessionId) return;
      setRoomNotice('A player left the match. This room has been aborted.');
      setError(null);
      setSession((current) => current ? {
        ...current,
        status: 'ABORTED',
        matchOutcome: 'CANCELLED'
      } : current);
      fetchSession();
    };

    const handleForceClosed = (payload) => {
      const incomingSessionId = payload?.sessionId?.toString?.() || payload?.sessionId;
      if (incomingSessionId && incomingSessionId !== sessionId) return;
      setRoomNotice(payload?.message || 'This game room has been Force Closed by the admin.');
      setError(null);
      setSession((current) => current ? {
        ...current,
        status: 'ABORTED',
        matchOutcome: 'CANCELLED'
      } : current);
      fetchSession();
    };

    socket.on('game:move', handleGameMove);
    socket.on('chat:message', handleChatMessage);
    socket.on('arena:room-aborted', handleRoomAborted);
    socket.on('arena:force-closed', handleForceClosed);

    return () => {
      socket.off('game:move', handleGameMove);
      socket.off('chat:message', handleChatMessage);
      socket.off('arena:room-aborted', handleRoomAborted);
      socket.off('arena:force-closed', handleForceClosed);
      
      // Leave room when component unmounts or session changes
      if (session?.gameType === 'ONLINE' && resolvedRoomCode) {
        socket.emit('leave-room', resolvedRoomCode);
      }
    };
  }, [sessionId, session?.gameType, resolvedRoomCode, fetchSession]); 

  const handleSyncMatch = async (sessionToSync, movesToSync) => {
    try {
      await gameService.syncLocalMatch({
        gameType: sessionToSync.gameType,
        boardSize: sessionToSync.boardSize,
        boardTheme: sessionToSync.boardTheme,
        p1Id: sessionToSync.p1.id,
        p1Name: sessionToSync.p1.name,
        p1Marker: sessionToSync.p1.marker,
        p2Name: sessionToSync.p2.name,
        p2Marker: sessionToSync.p2.marker,
        winnerId: sessionToSync.winnerId,
        winLine: sessionToSync.winLine,
        moves: movesToSync,
        status: sessionToSync.status,
        currentTurn: sessionToSync.currentTurn,
        boardState: sessionToSync.board
      });
    } catch (err) {
      console.error('Failed to sync match:', err);
    }
  };

  const makeMove = useCallback(async (row, col) => {
    if (isAILocking) return;
    if (!session || session.status !== 'ACTIVE') return;
    
    // Handle Local or AI Move locally
    if (session.gameType === 'LOCAL' || session.gameType === 'SINGLE') {
      const playerResult = processLocalMove(session, moves, row, col);
      if (!playerResult) return;

      let finalSession = playerResult.updatedSession;
      let finalMoves = playerResult.updatedMoves;
      let finalJustEnded = playerResult.justEnded;

      setMoves(finalMoves);
      setSession(finalSession);

      if (finalJustEnded) {
        handleSyncMatch(finalSession, finalMoves);
        return;
      }

      if (session.gameType === 'SINGLE') {
        setIsAILocking(true);

        await new Promise(resolve => setTimeout(resolve, 1000));

        const difficulty = finalSession.difficulty;
        const bestMove = getBestMove(finalSession.board, difficulty, finalSession.p2.marker, finalSession.p1.marker);
        
        const aiResult = processLocalMove(finalSession, finalMoves, bestMove.row, bestMove.col);
        if (aiResult) {
          setSession(aiResult.updatedSession);
          setMoves(aiResult.updatedMoves);

          if (aiResult.justEnded) {
            handleSyncMatch(aiResult.updatedSession, aiResult.updatedMoves);
          }
        }
        setIsAILocking(false);
      }
      return;
    }

    if (session.gameType === 'ONLINE') {
      const isP1 = session.p1 && String(session.p1.id) === String(user?.id);
      const isP2 = session.p2 && String(session.p2.id) === String(user?.id);
      const isMyTurn = (session.currentTurn === 'PLAYER1' && isP1) || (session.currentTurn === 'PLAYER2' && isP2);

      if (!isMyTurn) {
        console.log("It's not your turn!");
        return;
      }
      
      const currentMarker = session.currentTurn === 'PLAYER1' ? session.p1.marker : session.p2.marker;
      try {
        const res = await gameService.makeMove(sessionId, {
          row,
          col,
          marker: currentMarker
        });
        setSession(gameModel.formatSession(res.data));
      } catch (err) {
        console.error('Failed to make online move:', err);
        setError(err.message);
      }
    }
  }, [session, sessionId, user, resolvedRoomCode]);

  const reset = useCallback(() => {
    setSession(null);
    setChatMessages([]);
    setMoves([]);
    setError(null);
    setRoomNotice(null);
    if (sessionId && sessionId !== 'new') {
      fetchSession();
    }
  }, [sessionId, fetchSession]);

  const sendMessage = useCallback((message) => {
    if (!message || !message.trim()) return;
    
    const socket = getSocket();
    if (!socket) return;

    if (!resolvedRoomCode) {
      console.log(`Room #${resolvedRoomCode} not available`);
      return;
    }

    socket.emit('chat:message', { 
      roomCode: resolvedRoomCode,
      message: message.trim(),
      senderId: user?.id || user?._id,
      senderName: user?.username || 'Player'
    });
  }, [resolvedRoomCode, user]);

  return { session, loading, error, roomNotice, makeMove, refresh: reset, chatMessages, sendMessage, moves };
}

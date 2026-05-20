import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import arenaService from './arenaService';
import { API_CONFIG } from '../../configs/apiConfig';
import { useAuthStore } from '../../app/store/authStore';

let socket = null;

export function getSocket() {
  if (socket) return socket;

  const token = useAuthStore.getState().token;
  socket = io(API_CONFIG.BASE_URL.replace('/api/v1', ''), {
    autoConnect: false,
    auth: { token }
  });

  return socket;
}

export function useArenaRooms() {
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    let activeSocket = null;

    const syncRooms = async () => {
      try {
        const response = await arenaService.listRooms();
        if (!mounted) return;
        setRooms(response.data || []);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || 'Failed to load rooms');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    syncRooms();

    activeSocket = getSocket();
    if (token && !activeSocket.connected) {
      activeSocket.auth = { token };
      activeSocket.connect();
    }

    const handleRoomCreated = (room) => {
      setRooms((current) => [room, ...current.filter((item) => item.roomCode !== room.roomCode)]);
    };

    const handleRoomUpdated = (room) => {
      setRooms((current) => current.map((item) => (item.roomCode === room.roomCode ? { ...item, ...room } : item)));
    };

    const handleGameStarted = (payload) => {
      if (!payload) return;
      const sessionId = payload.sessionId || payload.session?.id || payload.sessionId;
      const roomCode = payload.roomCode;
      if (sessionId) {
        navigate(`/game/online/${sessionId}`, { state: { roomCode } });
      }
    };

    activeSocket.on('arena:room-created', handleRoomCreated);
    activeSocket.on('arena:room-updated', handleRoomUpdated);
    activeSocket.on('arena:game-started', handleGameStarted);

    return () => {
      mounted = false;
      if (activeSocket) {
        activeSocket.off('arena:room-created', handleRoomCreated);
        activeSocket.off('arena:room-updated', handleRoomUpdated);
        activeSocket.off('arena:game-started', handleGameStarted);
      }
    };
  }, [token]);

  const createRoom = async (config = {}) => {
    setSubmitting(true);
    setError(null);
    try {
      const response = await arenaService.createRoom(config);
      const newRoom = response?.data || response;
      if (newRoom?.roomCode) {
        setRooms((current) => [
          newRoom,
          ...current.filter((room) => room.roomCode !== newRoom.roomCode)
        ]);
      }
    } catch (err) {
      setError(err.message || 'Failed to create room');
    } finally {
      setSubmitting(false);
    }
  };

  const joinRoom = async (code = joinCode) => {
    if (!code.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await arenaService.joinRoom(code.trim());
    } catch (err) {
      setError(err.message || 'Failed to join room');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    rooms,
    loading,
    error,
    joinCode,
    setJoinCode,
    submitting,
    createRoom,
    joinRoom
  };
}

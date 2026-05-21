import { useState, useCallback, useEffect } from 'react';
import adminService from './adminService';
import adminModel from './adminModel';

export function useAdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isToggling, setIsToggling] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getUsers();
      // Assuming backend sends 
      const formattedUsers = adminModel.formatUserList(response.data);
      setUsers(formattedUsers);
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleUserStatus = async (userId, currentIsActive) => {
    try {
      setIsToggling(true);
      const newStatus = !currentIsActive;

      const response = await adminService.updateUserStatus(userId, newStatus);

      if (response.success) {
        // Optimistically update the UI to feel instant
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === userId ? { ...user, isActive: newStatus } : user
          )
        );
      }
      return response.success;
    } catch (err) {
      console.error('Failed to toggle user status:', err);
      return false;
    } finally {
      setIsToggling(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    isToggling,
    fetchUsers,
    toggleUserStatus
  }
}

export function useAdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const [pagination, setPagination] = useState(null);

  const fetchRooms = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getRooms(params);
      if (response.success && response.data) {
        const formattedRooms = adminModel.formatRoomList(response.data.rooms);
        setRooms(formattedRooms);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch rooms');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const closeRoom = async (roomId, reason) => {
    try {
      setIsClosing(true);
      const response = await adminService.closeRoom(roomId, reason);

      if (response.success) {
        setRooms(prevRooms =>
          prevRooms.map(room =>
            room.id === roomId ? { ...room, status: 'CLOSED' } : room
          )
        );
      }
      return response.success;
    } catch (err) {
      console.error('Failed to close room:', err);
      return false;
    } finally {
      setIsClosing(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return {
    rooms,
    loading,
    error,
    isClosing,
    pagination,
    fetchRooms,
    closeRoom
  };
}
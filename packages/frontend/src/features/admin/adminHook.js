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

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      setIsToggling(true);
      const newStatus = currentStatus === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE';
      
      const response = await adminService.updateUserStatus(userId, newStatus);
      
      if (response.success) {
        // Optimistically update the UI to feel instant
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId ? { ...user, status: newStatus } : user
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
  };
}

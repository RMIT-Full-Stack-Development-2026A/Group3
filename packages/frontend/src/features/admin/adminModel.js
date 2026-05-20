import { getAvatarUrl } from '../../shared/utils/avatarUtil';

const adminModel = {
  formatUserRow: (userData) => {
    if (!userData) return null;
    
    // Fallbacks for data to ensure the UI doesn't crash on missing fields
    return {
      id: userData._id || userData.id,
      username: userData.username,
      email: userData.email,
      country: userData.country,
      avatarUrl: getAvatarUrl(userData.avatarUrl, 100),
      isPremium: userData.isPremium || false,
      isActive: userData.isActive !== false,
    };
  },
  
  formatUserList: (usersData) => {
    if (!Array.isArray(usersData)) return [];
    return usersData.map(adminModel.formatUserRow);
  },

  formatRoomRow: (roomData) => {
    if (!roomData) return null;
    return {
      id: roomData._id || roomData.id,
      roomCode: roomData.roomCode || 'UNKNOWN',
      player1Name: roomData.player1Name || 'Unknown',
      player2Name: roomData.player2Name || 'Waiting...',
      status: roomData.status || 'WAITING',
      startTime: roomData.startTime || new Date().toISOString(),
      endTime: roomData.endTime || null
    };
  },

  formatRoomList: (roomsData) => {
    if (!Array.isArray(roomsData)) return [];
    return roomsData.map(adminModel.formatRoomRow);
  }
};

export default adminModel;

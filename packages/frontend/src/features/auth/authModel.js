/**
 * AuthModel - Client-side Data Structures
 * Defines how a User object should look across the frontend.
 */

export const UserRole = {
  PLAYER: 'PLAYER',
  ADMIN: 'ADMIN'
};

/**
 * Transforms backend user data into a clean frontend model
 */
export const createPlayerModel = (data) => {
  if (!data) return null;
  
  return {
    id: data._id || data.id,
    username: data.username,
    email: data.email,
    role: data.role || UserRole.PLAYER,
    isPremium: data.isPremium || false,
    avatarUrl: data.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${data.username}`,
    createdAt: data.createdAt,
    // Add other fields as needed based on database_design.md
  };
};

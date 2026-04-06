import { User } from './users.model.js';

export const usersRepository = {
  /**
   * Find user by username or email
   * @param {string} identifier - Username or email
   * @returns {Promise<Object|null>} User document or null
   */
  findByUsernameOrEmail: async (identifier) => {
    const normalizedIdentifier = identifier.trim().toLowerCase();
    return User.findOne({
      $or: [
        { username: normalizedIdentifier },
        { email: normalizedIdentifier }
      ]
    });
  }
};

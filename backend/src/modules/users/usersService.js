import { User } from './usersModel.js';

export const usersService = {
	getPublicById: async (userId) => {
		return User.findById(userId).select('_id username email role isActive createdAt updatedAt');
	}
};

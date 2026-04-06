import { usersRepository } from '../users/users.repository.js';


export const authRepository = {
	findUserByIdentifier: async (identifier) => {
		return usersRepository.findByUsernameOrEmail(identifier);
	}
};
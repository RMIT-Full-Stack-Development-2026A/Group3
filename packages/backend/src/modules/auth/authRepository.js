import { usersRepository } from '../users/usersRepository.js';


export const authRepository = {
	findUserByIdentifier: async (identifier) => {
		return usersRepository.findByUsernameOrEmail(identifier);
	}
};

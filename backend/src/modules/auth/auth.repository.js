const usersRepository = require('../users/users.repository');

const authRepository = {
	findUserByIdentifier: async (identifier) => {
		return usersRepository.findByUsernameOrEmail(identifier);
	}
};

module.exports = authRepository;

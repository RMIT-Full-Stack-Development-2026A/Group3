const User = require('./users.model');

const usersRepository = {
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

module.exports = usersRepository;

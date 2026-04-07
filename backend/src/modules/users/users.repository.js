const { User } = require('./users.model');

const usersRepository = {
	findByUsernameOrEmail: async (identifier) => {
		const normalizedIdentifier = identifier.trim().toLowerCase();

		return User.findOne({
			$or: [
				{ username: normalizedIdentifier },
				{ email: normalizedIdentifier }
			]
		});
	},

	findById: async (userId) => {
		return User.findById(userId);
	}
};

module.exports = usersRepository;

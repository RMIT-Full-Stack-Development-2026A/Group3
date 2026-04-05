const profileRepository = require('./profile.repository');

const createProfileService = (repository = profileRepository) => {
	return {
		getMatchHistory: async (query) => {
			return repository.getPaginatedMatchHistory(query);
		}
	};
};

const profileService = createProfileService();

module.exports = {
	createProfileService,
	profileService
};

import { Profile, UserStatistic } from './profileModel.js';

export const profileRepository = {
	findProfileByUserId: async (userId) => {
		return Profile.findOne({ userId });
	},

	findStatisticByUserId: async (userId) => {
		return UserStatistic.findOne({ userId });
	}
};

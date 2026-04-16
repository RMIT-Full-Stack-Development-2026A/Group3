import { profileRepository } from './profileRepository.js';

const emptyStats = {
	totalGames: 0,
	wins: 0,
	losses: 0,
	draws: 0,
	eloRating: 1000
};

export const profileService = {
	getProfileOverview: async (userId) => {
		const [profile, statistic] = await Promise.all([
			profileRepository.findProfileByUserId(userId),
			profileRepository.findStatisticByUserId(userId)
		]);

		if (!profile) {
			return null;
		}

		return {
			userId: profile.userId,
			country: profile.country,
			avatarUrl: profile.avatarUrl || '',
			isPremium: profile.isPremium === true,
			walletBalance: profile.walletBalance || 0,
			premiumExpiry: profile.premiumExpiry,
			statistics: statistic
				? {
						totalGames: statistic.totalGames,
						wins: statistic.wins,
						losses: statistic.losses,
						draws: statistic.draws,
						eloRating: statistic.eloRating
					}
				: emptyStats,
			updatedAt: profile.updatedAt
		};
	}
};

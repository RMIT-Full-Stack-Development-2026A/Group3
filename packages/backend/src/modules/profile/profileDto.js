import GameDTO from "../game/gameDto.js";

export class ProfileDTO {    
    static transformUpdateReq(body = {}) {
        const { country, username, avatarUrl } = body;
        const validatedData = {};


        if (country) {
            if (typeof country !== 'string' || country.trim().length < 2) {
                throw new Error('Country must be a string with at least 2 characters');
            }
            validatedData.country = country.trim();
        }


        if (username) {
            if (typeof username !== 'string' || !/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
                throw new Error('Username must be 3-20 characters and can only contain letters, numbers, _ and -');
            }
            validatedData.username = username.trim();
        }

        if (avatarUrl) {
            if (typeof avatarUrl !== 'string' || !avatarUrl.startsWith('http')) {
                throw new Error('Invalid avatar URL');
            }
            validatedData.avatarUrl = avatarUrl.trim();
        }


        if (Object.keys(validatedData).length === 0) {
            throw new Error('At least one field (country, username, or avatarUrl) must be provided for update');
        }


        return validatedData;
    };

    static formatResponse(user, profile, stats) {
        if (!user || !profile) return null;

        const totalGames = stats?.totalGames || 0;
        const wins = stats?.wins || 0;
        const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;


        return {
            user: {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                role: user.role,
                joinedAt: user.createdAt
            },
            profile: {
                country: profile.country,
                avatarUrl: profile.avatarUrl || '',
                isPremium: profile.isPremium,
                walletBalance: profile.walletBalance,
                premiumExpiry: profile.premiumExpiry
            },
            statistics: {
                totalGames,
                wins,
                losses: stats?.losses || 0,
                draws: stats?.draws || 0,
                eloRating: stats?.eloRating || 1000,
                winRate: `${winRate}%`
            }
        };
    }

    static transformMatchHistoryQuery(userId, query = {}) {
        return GameDTO.transformHistoryQuery(userId, query);
    }

    static formatMatchHistoryResponse(payload) {
        return GameDTO.formatHistoryResponse(payload);
    }
}

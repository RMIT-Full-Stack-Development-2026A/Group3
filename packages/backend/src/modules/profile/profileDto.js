/**
 * Profile DTO (Data Transfer Object)
 * Chịu trách nhiệm xác thực đầu vào và định dạng đầu ra cho module Profile.
 */

export const updateProfileRequestDto = {
  /**
   * Xác thực dữ liệu cập nhật hồ sơ
   */
  validate: (body = {}) => {
    const { country, username } = body;
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

    if (Object.keys(validatedData).length === 0) {
      throw new Error('At least one field (country or username) must be provided for update');
    }

    return validatedData;
  }
};

export const profileResponseDto = {
  /**
   * Chuyển đổi dữ liệu thô từ DB thành object chuẩn cho Frontend
   */
  build: (user, profile, stats) => {
    if (!user || !profile) return null;

    // Tính toán tỉ lệ thắng
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
        avatarUrl: profile.avatarUrl,
        isPremium: profile.isPremium,
        walletBalance: profile.walletBalance,
        premiumExpiry: profile.premiumExpiry
      },
      statistics: {
        totalGames: totalGames,
        wins: wins,
        losses: stats?.losses || 0,
        draws: stats?.draws || 0,
        eloRating: stats?.eloRating || 1000,
        winRate: winRate
      }
    };
  }
};

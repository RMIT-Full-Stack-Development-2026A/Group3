export const DEFAULT_PROFILE = {
	username: 'ProGamer',
	avatarUrl: '',
	premium: true,
	country: 'Singapore',
	countryFlag: 'SG',
	memberSince: '2025-01-15',
	stats: {
		totalGames: 142,
		wins: 89,
		losses: 45,
		draws: 8,
		winRate: 62.7,
	}
};

export const DEFAULT_MATCH_HISTORY_QUERY = {
	page: 1,
	limit: 8,
	search: '',
	result: 'ALL',
	date: '',
	sortOrder: 'desc'
};

export const RESULT_FILTER_OPTIONS = [
	{ label: 'All Results', value: 'ALL' },
	{ label: 'Win', value: 'WIN' },
	{ label: 'Loss', value: 'LOSS' },
	{ label: 'Draw', value: 'DRAW' }
];

export const SORT_OPTIONS = [
	{ label: 'Newest First', value: 'desc' },
	{ label: 'Oldest First', value: 'asc' }
];

const calculateWinRate = (wins, totalGames) => {
	if (!totalGames) {
		return 0;
	}
	return Number(((wins / totalGames) * 100).toFixed(1));
};

export const normalizeMatchHistoryPayload = (payload = {}) => {
	const rawItems = Array.isArray(payload.items) ? payload.items : [];

	const items = rawItems.map((item) => ({
		matchId: item.matchId || '',
		opponentName: item.opponentName || 'Unknown',
		gameType: item.gameType || 'ONLINE',
		boardSize: item.boardSize || 10,
		result: item.result || 'LOSS',
		status: item.status || '',
		playedAt: item.playedAt || null,
	}));

	const totalGames = items.length;
	const wins = items.filter((item) => item.result === 'WIN').length;
	const losses = items.filter((item) => item.result === 'LOSS').length;
	const draws = items.filter((item) => item.result === 'DRAW').length;

	return {
		items,
		pagination: {
			page: payload.pagination?.page || 1,
			limit: payload.pagination?.limit || 8,
			totalItems: payload.pagination?.totalItems || 0,
			totalPages: payload.pagination?.totalPages || 0,
			hasNextPage: Boolean(payload.pagination?.hasNextPage),
			hasPreviousPage: Boolean(payload.pagination?.hasPreviousPage)
		},
		stats: {
			totalGames,
			wins,
			losses,
			draws,
			winRate: calculateWinRate(wins, totalGames)
		}
	};
};


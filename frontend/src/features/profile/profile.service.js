import httpClient from '../../utils/httpHelper';

import { normalizeMatchHistoryPayload } from './profile.model';

const removeEmptyParams = (params) => {
	const cleanedParams = { ...params };

	Object.keys(cleanedParams).forEach((key) => {
		if (cleanedParams[key] === '' || cleanedParams[key] === null || cleanedParams[key] === undefined) {
			delete cleanedParams[key];
		}
	});

	return cleanedParams;
};

export const getMatchHistory = async ({ page, limit, search, result, date, sortOrder }) => {
	const params = removeEmptyParams({
		page,
		limit,
		search,
		result: result === 'ALL' ? '' : result,
		date,
		sortBy: 'date',
		sortOrder,
	});

	const response = await httpClient.get('/profile/matches', { params });
	return normalizeMatchHistoryPayload(response.data?.data || {});
};


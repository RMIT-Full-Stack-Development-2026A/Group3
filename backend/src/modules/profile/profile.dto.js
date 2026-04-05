const { Types } = require('mongoose');

const MAX_LIMIT = 50;
const ALLOWED_RESULTS = new Set(['ALL', 'WIN', 'LOSS', 'DRAW']);
const ALLOWED_SORT_FIELDS = new Set(['date']);

const createBadRequestError = (message, details = null) => {
	const error = new Error(message);
	error.statusCode = 400;
	error.errorCode = 'BAD_REQUEST';
	if (details) {
		error.details = details;
	}
	return error;
};

const parsePositiveInteger = (rawValue, fallback) => {
	if (rawValue === undefined || rawValue === null || rawValue === '') {
		return fallback;
	}

	const parsed = Number.parseInt(rawValue, 10);
	if (Number.isNaN(parsed) || parsed <= 0) {
		throw createBadRequestError('Pagination values must be positive integers.');
	}
	return parsed;
};

const parseDateOnly = (rawValue, fieldName) => {
	if (!rawValue) {
		return null;
	}

	if (!/^\d{4}-\d{2}-\d{2}$/.test(rawValue)) {
		throw createBadRequestError(`${fieldName} must follow YYYY-MM-DD format.`);
	}

	const date = new Date(`${rawValue}T00:00:00.000Z`);
	if (Number.isNaN(date.getTime())) {
		throw createBadRequestError(`${fieldName} is invalid.`);
	}

	return date;
};

const toMatchHistoryQuery = (currentUserId, query = {}) => {
	const userId = String(currentUserId || '').trim();
	if (!Types.ObjectId.isValid(userId)) {
		throw createBadRequestError('Authenticated user id is invalid.');
	}

	const page = parsePositiveInteger(query.page, 1);
	const requestedLimit = parsePositiveInteger(query.limit, 10);
	const limit = Math.min(requestedLimit, MAX_LIMIT);

	const search = String(query.search || query.q || '').trim();

	const result = String(query.result || 'ALL').trim().toUpperCase();
	if (!ALLOWED_RESULTS.has(result)) {
		throw createBadRequestError('result must be one of ALL, WIN, LOSS, DRAW.');
	}

	const date = parseDateOnly(query.date, 'date');
	const dateFrom = parseDateOnly(query.dateFrom, 'dateFrom');
	const dateTo = parseDateOnly(query.dateTo, 'dateTo');

	if (dateFrom && dateTo && dateFrom.getTime() > dateTo.getTime()) {
		throw createBadRequestError('dateFrom must be before or equal to dateTo.');
	}

	const sortBy = String(query.sortBy || 'date').trim().toLowerCase();
	if (!ALLOWED_SORT_FIELDS.has(sortBy)) {
		throw createBadRequestError('sortBy currently supports only date.');
	}

	const sortOrder = String(query.sortOrder || 'desc').trim().toLowerCase() === 'asc' ? 'asc' : 'desc';

	return {
		userId,
		page,
		limit,
		search,
		result,
		date,
		dateFrom,
		dateTo,
		sortBy,
		sortOrder
	};
};

module.exports = {
	toMatchHistoryQuery
};


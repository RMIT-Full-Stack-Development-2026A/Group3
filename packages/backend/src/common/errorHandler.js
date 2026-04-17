/**
 * Global Error Handler
 */
import { responseHelper } from './responseHelper.js';

const errorHandler = (err, req, res, next) => {
	const statusCode = Number.isInteger(err?.statusCode)
		? err.statusCode
		: Number.isInteger(err?.status)
			? err.status
			: 500;

	const errorCode = err?.errorCode
		|| (statusCode === 400 ? 'BAD_REQUEST' : statusCode === 404 ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR');

	const message = err?.message || 'Internal server error';

	return responseHelper.sendError(res, statusCode, errorCode, message, err?.details || null);
};

export default errorHandler;

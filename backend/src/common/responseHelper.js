/**
 * Response Helper
 * Exports sendSuccess and sendError functions.
 */
const responseHelper = {
    sendSuccess: (res, statusCode = 200, data = null, message = 'Success') => {
        return res.status(statusCode).json({
            success: true,
            message,
            data
        });
    },
    sendError: (res, statusCode = 500, errorCode = 'INTERNAL_SERVER_ERROR', message = 'Internal server error', details = null) => {
        const errorPayload = {
            code: errorCode,
            message
        };

        if (details) {
            errorPayload.details = details;
        }

        return res.status(statusCode).json({
            success: false,
            error: errorPayload
        });
    }
};

module.exports = responseHelper;

/**
 * Response Helper
 * Exports sendSuccess and sendError functions.
 */
const responseHelper = {
    sendSuccess: (res, statusCode = 200, data = null, message = 'OK') => {
        return res.status(statusCode).json({
            success: true,
            data,
            message
        });
    },
    sendError: (res, statusCode = 500, errorCode = 'SERVER_ERROR', message = 'Unexpected error') => {
        return res.status(statusCode).json({
            success: false,
            error: {
                code: errorCode,
                message
            }
        });
    }
};

export default responseHelper;

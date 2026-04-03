/**
 * Response Helper
 * Exports sendSuccess and sendError functions.
 */
const responseHelper = {
  /**
   * Send a successful response to the client
   * @param {Object} res - Express response object
   * @param {number} statusCode - HTTP status code
   * @param {any} data - Response payload/data
   * @param {string} message - Success message (optional)
   */
  sendSuccess: (res, statusCode, data, message = 'Success') => {
    res.status(statusCode).json({
      success: true,
      data: data,
      message: message
    });
  },

  /**
   * Send an error response to the client
   * @param {Object} res - Express response object
   * @param {number} statusCode - HTTP status code
   * @param {string} errorCode - Error code for client-side handling
   * @param {string} message - Error message
   */
  sendError: (res, statusCode, errorCode, message) => {
    res.status(statusCode).json({
      success: false,
      errorCode: errorCode,
      message: message
    });
  }
};

module.exports = responseHelper;

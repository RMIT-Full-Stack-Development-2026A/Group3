const authService = require('./auth.service');
const { loginRequestDTO } = require('./auth.request');
const { loginResponseDTO } = require('./auth.response');
const { sendSuccess, sendError } = require('../../common/responseHelper');

const authController = {
  login: async (req, res) => {
    try {
      const validatedRequest = loginRequestDTO.validate(req.body);
      const { token, user } = await authService.login(
        validatedRequest.identifier,
        validatedRequest.password
      );
      const responseData = loginResponseDTO.build(user, token);
      sendSuccess(res, 200, responseData, 'Login successful');
    } catch (error) {
      const isValidationError =
        error.message.includes('required') || error.message.includes('must be a string');
      const statusCode = isValidationError ? 400 : 401;
      const errorCode = isValidationError ? 'VALIDATION_ERROR' : 'AUTH_FAILED';

      sendError(res, statusCode, errorCode, error.message);
    }
  }
};

module.exports = authController;

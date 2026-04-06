import { authService } from './auth.service.js';
import { loginRequestDTO, registerRequestDTO, loginResponseDTO } from './auth.dto.js';
import { responseHelper } from '../../common/responseHelper.js';

const { sendSuccess, sendError } = responseHelper;


export const authController = {

    register: async (req, res) => {
    try {
      const validatedRequest = registerRequestDTO.validate(req.body);

      const user = await authService.register(validatedRequest);

      const responseData = loginResponseDTO.build(user, null); // No token on registration

      sendSuccess(res, 201, responseData, 'Register successful');
    } catch (error) {
      const isValidationError =
        error.message.includes('required') ||
        error.message.includes('must') ||
        error.message.includes('invalid');

      const statusCode = isValidationError ? 400 : 409;
      const errorCode = isValidationError ? 'VALIDATION_ERROR' : 'REGISTER_FAILED';
      
      sendError(res, statusCode, errorCode, error.message);
    }
  },


  
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
  },

  logout: async (req, res) => {
    try {
      sendSuccess(res, 200, null, 'Logout successful');
    } catch (error) {
      sendError(res, 500, 'LOGOUT_FAILED', 'An error occurred during logout');
    }
  }
};


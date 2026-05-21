import { responseHelper } from '../../common/responseHelper.js';
import AuthService from './authService.js';
import AuthDTO from './authDto.js';

const { sendSuccess, sendError } = responseHelper;

class AuthController {
  /**
   * Đăng ký người dùng mới
   */
  async register(req, res) {
    try {
      // 1. DTO Transformation & Validation
      const validatedData = AuthDTO.transformRegisterReq(req.body);

      // 2. Service Call
      const newUser = await AuthService.register(validatedData);

      // 3. Response (Success only, errors handled by catch)
      return sendSuccess(res, 201, { id: newUser._id }, 'Registration successful');
    } catch (error) {
      const status = error.message.includes('exists') ? 400 : 500;
      return sendError(res, status, 'REGISTER_FAILED', error.message);
    }
  }

  /**
   * Đăng nhập
   */
  async login(req, res) {
    try {
      // 1. DTO Transformation
      const { identifier, password } = AuthDTO.transformLoginReq(req.body);

      // 2. Service Call
      const { user, profile, token } = await AuthService.login(identifier, password);

      // 3. Response building via DTO
      const result = AuthDTO.formatAuthResponse(user, profile, token);

      return sendSuccess(res, 200, result, 'Login successful');
    } catch (error) {
      const status = error.message.includes('Invalid') ? 401 : 500;
      return sendError(res, status, 'LOGIN_FAILED', error.message);
    }
  }

  /**
   * Đăng xuất (Client-side mainly, but provided for consistency)
   */
  async logout(req, res) {
    return sendSuccess(res, 200, null, 'Logged out successfully');
  }
}

export default new AuthController();
import AuthService from './authService.js';
import { loginRequestDTO, registerRequestDTO, loginResponseDTO } from './authDto.js';
import { responseHelper } from '../../common/responseHelper.js';

const { sendSuccess, sendError } = responseHelper;

export const authController = {

  register: async (req, res) => {
    try {
      // 1. Validate đầu vào (Trả về { authData, profileData })
      const validatedRequest = registerRequestDTO.validate(req.body);

      // 2. Gọi Service xử lý (Service giờ sẽ tạo cả User và Profile)
      const { user, profile } = await AuthService.register(validatedRequest);

      // 3. Build response (Registration thường chưa trả Token ngay, tùy logic team bạn)
      const responseData = loginResponseDTO.build(user, profile, null);

      return sendSuccess(res, 201, responseData, 'Register successful');
    } catch (error) {
      // Phân loại lỗi dựa trên nội dung hoặc type
      const statusCode = error.message.includes('exists') ? 409 : 400;
      return sendError(res, statusCode, 'REGISTER_FAILED', error.message);
    }
  },

  login: async (req, res) => {
    try {
      // 1. Validate đầu vào
      const { identifier, password } = loginRequestDTO.validate(req.body);

      // 2. Gọi Service (Service giờ trả về bộ 3: user, profile, token)
      const { user, profile, token } = await AuthService.login(identifier, password);

      // 3. Đưa cả profile vào để build DTO chuẩn
      const responseData = loginResponseDTO.build(user, profile, token);

      return sendSuccess(res, 200, responseData, 'Login successful');
    } catch (error) {
      // 401 cho lỗi sai credentials, 400 cho lỗi validation
      const statusCode = error.message.includes('credentials') ? 401 : 400;
      return sendError(res, statusCode, 'AUTH_FAILED', error.message);
    }
  },

  logout: async (req, res) => {
    try {
      // Với JWT, logout chủ yếu là xóa token ở client. 
      // Ở server bạn có thể blacklist token nếu muốn nâng cao.
      return sendSuccess(res, 200, null, 'Logout successful');
    } catch (error) {
      return sendError(res, 500, 'LOGOUT_FAILED', error.message);
    }
  }
};
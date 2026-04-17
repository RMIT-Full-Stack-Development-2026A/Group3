import { responseHelper } from '../../common/responseHelper.js';
import UsersService from './usersService.js';
import AuthDTO from '../auth/authDto.js';

const { sendSuccess, sendError } = responseHelper;

class UsersController {
  async getMe(req, res) {
    try {
      if (!req.user || !req.user.id) {
        return sendError(res, 401, 'UNAUTHORIZED', 'Missing user authentication');
      }

      const user = await UsersService.getPublicById(req.user.id);
      if (!user) {
        return sendError(res, 404, 'USER_NOT_FOUND', 'User profile not found');
      }

      // Transform response to use 'id' instead of '_id'
      const responseData = AuthDTO.formatUserResponse(user);

      return sendSuccess(res, 200, responseData, 'User profile fetched successfully');
    } catch (error) {
      return sendError(res, 500, 'USERS_FETCH_FAILED', error.message || 'Failed to fetch user');
    }
  }
}

export default new UsersController();

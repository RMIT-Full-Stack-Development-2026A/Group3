/** game controller */
import mongoose from 'mongoose';
import responseHelper from '../../common/responseHelper.js';
import gameService from './game.service.js';
import gameDTO from './game.dto.js';

const getReplaySession = async (req, res) => {
	try {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return responseHelper.sendError(res, 400, 'INVALID_GAME_ID', 'Game id is invalid.');
		}

		const session = await gameService.getReplaySession(id, req.user);
		const replayResponse = gameDTO.toReplayResponse(session);

		return responseHelper.sendSuccess(res, 200, replayResponse, 'Replay session loaded');
	} catch (error) {
		return responseHelper.sendError(
			res,
			error.statusCode || 500,
			error.errorCode || 'REPLAY_SESSION_ERROR',
			error.message || 'Unable to load replay session'
		);
	}
};

export default {
	getReplaySession
};

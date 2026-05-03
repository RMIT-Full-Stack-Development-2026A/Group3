/** game controller */
const responseHelper = require('../../common/responseHelper');
const gameService = require('./game.service');
const gameDTO = require('./game.dto');

const getReplaySession = async (req, res) => {
	try {
		const { id } = req.params;
		const session = await gameService.getReplaySession(id);
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

module.exports = {
	getReplaySession
};

/** game repository */
const { GameSession } = require('./game.model');

const findSessionById = async (sessionId) => {
	return GameSession.findById(sessionId).lean();
};

module.exports = {
	findSessionById
};

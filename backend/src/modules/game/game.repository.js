/** game repository */
const findSessionById = async (sessionId) => {
	const { GameSession } = await import('./game.model.js');
	return GameSession.findById(sessionId).lean();
};

module.exports = {
	findSessionById
};

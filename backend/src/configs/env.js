/**
 * Env Utility
 */
const envConfig = {
	MONGO_URI: process.env.MONGO_URI || process.env.MONGODB_URI,
	JWT_SECRET: process.env.JWT_SECRET
};

module.exports = envConfig;

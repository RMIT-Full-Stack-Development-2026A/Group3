/**
 * Env Utility
 */
const envConfig = {
    PORT: process.env.PORT || 5000,
    MONGO_URI: process.env.MONGO_URI
};

module.exports = envConfig;

import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for Login route
 * Block IP if too many requests in a period of time
 */
export const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Maximum 20 requests from each IP in windowMs
    message: {
        status: 429, // Too many requests
        message: 'Too many request from this IP. Please try again after 15 minutes.'
    },
    standardHeaders: true, // Return limit information in headers `RateLimit-*`
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

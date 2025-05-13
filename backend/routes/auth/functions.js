const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
	windowMs: 60 * 1000,
	max: 50,
	skipSuccessfulRequests: false,
    keyGenerator: (req) => req.headers['cf-connecting-ip'] || req.ip
});

const isAuthed = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.status(401).json({ error: 'UNAUTHENTICATED', message: 'Authentication required.' });
    }
};

// Function to extract JWT from Authorization header
const getReqToken = (req) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7); // Extract token after 'Bearer '
    }
    // Fallback: Check cookies if needed, though less common for API tokens
    // if (req.cookies && req.cookies.jwt) { 
    //     return req.cookies.jwt;
    // }
    return null; // Return null if no token found
};

module.exports = {
    isAuthed,
    expiresIn: null,
    apiLimiter,
    getReqToken
};
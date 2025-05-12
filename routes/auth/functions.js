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

module.exports = {
    isAuthed,
    expiresIn: null,
    apiLimiter
};
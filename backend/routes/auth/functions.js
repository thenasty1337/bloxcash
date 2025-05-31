const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { ulid } = require('ulid');
const bcrypt = require('bcrypt');
const { sql } = require('../../database');
const { formatConsoleError } = require('../../utils');

// Rate limiting configuration
const apiLimiter = rateLimit({
	windowMs: 60 * 1000,
	max: 50,
	skipSuccessfulRequests: false,
    keyGenerator: (req) => req.headers['cf-connecting-ip'] || req.ip
});

// More strict rate limiter for login/sensitive endpoints
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per IP per 15 minutes
    skipSuccessfulRequests: true, // Don't count successful logins
    keyGenerator: (req) => req.headers['cf-connecting-ip'] || req.ip,
    handler: (req, res) => {
        res.status(429).json({
            error: 'TOO_MANY_ATTEMPTS',
            message: 'Too many login attempts. Please try again later.'
        });
    }
});

// Token settings
const tokenSettings = {
    access: {
        expiresIn: '15m', // Short-lived
        // Using consistent secrets (or from env) to ensure tokens stay valid across restarts
        secret: process.env.JWT_ACCESS_SECRET || 'NOVACASINO-access-static-secret-do-not-use-in-prod'
    },
    refresh: {
        expiresIn: '7d', // 7 days
        secret: process.env.JWT_REFRESH_SECRET || 'NOVACASINO-refresh-static-secret-do-not-use-in-prod'
    }
};

// Cookie settings
const secureCookieSettings = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
};

// Generate tokens for a user
const generateTokens = async (user) => {
    // Create a token family ID to track related refresh tokens
    const familyId = ulid();
    
    // Generate access token
    const accessToken = jwt.sign(
        { 
            userId: user.id,
            role: user.role || 0,
            perms: user.perms || 0,
        },
        tokenSettings.access.secret,
        { expiresIn: tokenSettings.access.expiresIn }
    );
    
    // Generate refresh token
    const refreshToken = jwt.sign(
        { 
            userId: user.id,
            family: familyId 
        },
        tokenSettings.refresh.secret,
        { expiresIn: tokenSettings.refresh.expiresIn }
    );
    
    // Store refresh token hash in database
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    const tokenId = ulid();
    
    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
    
    try {
        await sql.query(
            'INSERT INTO user_tokens (id, userId, tokenHash, family, expiresAt) VALUES (?, ?, ?, ?, ?)',
            [tokenId, user.id, refreshTokenHash, familyId, expiresAt]
        );
    } catch (error) {
        console.error('Error storing refresh token:', formatConsoleError(error));
        throw new Error('Failed to save authentication token');
    }
    
    return { accessToken, refreshToken, familyId };
};

// Set authentication cookies
const setAuthCookies = (res, accessToken, refreshToken) => {
    res.cookie('accessToken', accessToken, {
        ...secureCookieSettings,
        maxAge: 15 * 60 * 1000 // 15 minutes in milliseconds
    });
    
    res.cookie('refreshToken', refreshToken, {
        ...secureCookieSettings,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    });
};

// Clear authentication cookies
const clearAuthCookies = (res) => {
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });
};

// Verify refresh token and issue new tokens
const refreshTokens = async (refreshToken) => {
    try {
        // Verify the refresh token
        const decoded = jwt.verify(refreshToken, tokenSettings.refresh.secret);
        
        // Get the user
        const [[user]] = await sql.query(
            'SELECT id, email, username, avatar, perms, banned, balance, xp, role FROM users WHERE id = ?',
            [decoded.userId]
        );
        
        if (!user) {
            throw new Error('User not found');
        }
        
        if (user.banned) {
            throw new Error('Account is banned');
        }
        
        // Find the token family in the database
        const [[tokenRecord]] = await sql.query(
            'SELECT * FROM user_tokens WHERE userId = ? AND family = ? AND isRevoked = false AND expiresAt > NOW()',
            [user.id, decoded.family]
        );
        
        if (!tokenRecord) {
            throw new Error('Invalid refresh token');
        }
        
        // Check if we need to revoke this token family (suspicious activity)
        // This is a security measure - if someone attempts to use a refresh token
        // from the same family but with a different hash, we revoke the entire family
        const validToken = await bcrypt.compare(refreshToken, tokenRecord.tokenHash);
        if (!validToken) {
            // Potential token theft attempt - revoke all tokens in this family
            await sql.query(
                'UPDATE user_tokens SET isRevoked = true WHERE family = ?',
                [decoded.family]
            );
            throw new Error('Invalid refresh token');
        }
        
        // Generate new tokens
        // Revoke the current token first
        await sql.query(
            'UPDATE user_tokens SET isRevoked = true WHERE id = ?',
            [tokenRecord.id]
        );
        
        // Generate new token pair
        return await generateTokens(user);
        
    } catch (error) {
        console.error('Token refresh error:', formatConsoleError(error));
        throw error;
    }
};

// Authenticate middleware using JWT in cookies
const authenticate = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;
        
        if (!accessToken) {
            return res.status(401).json({ 
                error: 'UNAUTHENTICATED', 
                message: 'Authentication required.' 
            });
        }
        
        try {
            // Verify the access token
            const decoded = jwt.verify(accessToken, tokenSettings.access.secret);
            
            // Get the user from DB to ensure they still exist and aren't banned
            const [[user]] = await sql.query(
                'SELECT id, email, username, avatar, perms, banned, balance, xp, role FROM users WHERE id = ?',
                [decoded.userId]
            );
            
            if (!user || user.banned) {
                return res.status(401).json({ 
                    error: 'UNAUTHENTICATED', 
                    message: 'User is invalid or banned.' 
                });
            }
            
            // Set user on request object
            req.user = user;
            next();
        } catch (error) {
            // Token expired or invalid
            // Try to refresh using refresh token
            const refreshToken = req.cookies.refreshToken;
            
            if (!refreshToken) {
                return res.status(401).json({ 
                    error: 'UNAUTHENTICATED', 
                    message: 'Authentication required.' 
                });
            }
            
            try {
                // Attempt to refresh the tokens
                const { accessToken, refreshToken: newRefreshToken } = await refreshTokens(refreshToken);
                
                // Set new cookies
                setAuthCookies(res, accessToken, newRefreshToken);
                
                // Try again with the new token
                const decoded = jwt.verify(accessToken, tokenSettings.access.secret);
                
                // Get the user
                const [[user]] = await sql.query(
                    'SELECT id, email, username, avatar, perms, banned, balance, xp, role FROM users WHERE id = ?',
                    [decoded.userId]
                );
                
                if (!user || user.banned) {
                    return res.status(401).json({ 
                        error: 'UNAUTHENTICATED', 
                        message: 'User is invalid or banned.' 
                    });
                }
                
                req.user = user;
                next();
            } catch (refreshError) {
                // Clear any cookies if refresh fails
                clearAuthCookies(res);
                return res.status(401).json({ 
                    error: 'UNAUTHENTICATED', 
                    message: 'Session expired. Please login again.' 
                });
            }
        }
    } catch (error) {
        console.error('Authentication error:', formatConsoleError(error));
        return res.status(500).json({ 
            error: 'SERVER_ERROR', 
            message: 'An error occurred during authentication.' 
        });
    }
};

// Function to extract JWT from requests (for backward compatibility or header-based auth)
const getReqToken = (req) => {
    // First check the cookies (primary auth method)
    if (req.cookies && req.cookies.accessToken) {
        return req.cookies.accessToken;
    }
    
    // Fallback to authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7); // Extract token after 'Bearer '
    }
    
    return null; // Return null if no token found
};

// Revoke all refresh tokens for a user
const revokeAllUserTokens = async (userId) => {
    try {
        await sql.query('UPDATE user_tokens SET isRevoked = true WHERE userId = ?', [userId]);
    } catch (error) {
        console.error('Error revoking user tokens:', formatConsoleError(error));
        throw error;
    }
};

// Revoke a specific refresh token
const revokeRefreshToken = async (refreshToken) => {
    try {
        // Verify the token first to get its payload
        const decoded = jwt.verify(refreshToken, tokenSettings.refresh.secret);
        
        // Update the database
        await sql.query(
            'UPDATE user_tokens SET isRevoked = true WHERE userId = ? AND family = ?',
            [decoded.userId, decoded.family]
        );
    } catch (error) {
        console.error('Error revoking refresh token:', formatConsoleError(error));
        throw error;
    }
};

// Backward compatibility layer for existing code that uses isAuthed
const isAuthed = authenticate;

// Backward compatibility for expiresIn which was used with jwt
const expiresIn = tokenSettings.access.expiresIn;

module.exports = {
    apiLimiter,
    loginLimiter,
    authenticate,
    generateTokens,
    setAuthCookies,
    clearAuthCookies,
    refreshTokens,
    getReqToken,
    revokeAllUserTokens,
    revokeRefreshToken,
    // Export token settings for use in other modules
    tokenSettings,
    secureCookieSettings,
    // Compatibility exports for existing code
    isAuthed,
    expiresIn
};
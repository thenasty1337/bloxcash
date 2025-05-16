const express = require('express');
const bcrypt = require('bcrypt');
const { ulid } = require('ulid');

const router = express.Router();

const { sql } = require('../../database');
const { 
    apiLimiter, 
    loginLimiter,
    generateTokens,
    setAuthCookies,
    clearAuthCookies,
    authenticate,
    revokeRefreshToken,
    revokeAllUserTokens,
    refreshTokens
} = require('./functions');
const { formatConsoleError } = require('../../utils');
const { createUserSeeds } = require('../../fairness');

const saltRounds = 10;

// Login endpoint
router.post('/login', loginLimiter, async (req, res) => {
    try {
        if (!req.body.email || !req.body.password) {
            return res.status(400).json({ error: 'MISSING_CREDENTIALS' });
        }

        // Find the user
        const [[user]] = await sql.query(
            'SELECT id, email, username, passwordHash, perms, banned, balance, xp, role FROM users WHERE email = ?', 
            [req.body.email]
        );

        if (!user) {
            return res.status(401).json({ 
                error: 'INVALID_CREDENTIALS', 
                message: 'Incorrect email or password.' 
            });
        }

        if (user.banned) {
            return res.status(401).json({ 
                error: 'ACCOUNT_BANNED', 
                message: 'Account is banned.' 
            });
        }

        // Verify password
        const match = await bcrypt.compare(req.body.password, user.passwordHash);
        if (!match) {
            return res.status(401).json({ 
                error: 'INVALID_CREDENTIALS', 
                message: 'Incorrect email or password.' 
            });
        }

        // Generate tokens and set cookies
        const { accessToken, refreshToken } = await generateTokens(user);
        setAuthCookies(res, accessToken, refreshToken);

        // Return user data (without passwordHash)
        const { passwordHash, ...userInfo } = user;
        return res.json({ 
            message: 'Login successful', 
            user: userInfo 
        });
    } catch (error) {
        console.error('Login Error:', formatConsoleError(error));
        res.status(500).json({ error: 'SERVER_ERROR' });
    }
});

router.post('/signup', apiLimiter, async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'MISSING_FIELDS' });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: 'PASSWORD_TOO_SHORT'});
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
         return res.status(400).json({ error: 'INVALID_EMAIL' });
    }
     if (username.length < 3 || username.length > 20 || !username.match(/^[a-zA-Z0-9_]+$/)) {
         return res.status(400).json({ error: 'INVALID_USERNAME' });
    }

    try {
        const [[existingUser]] = await sql.query('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
        if (existingUser) {
            return res.status(409).json({ error: 'USER_EXISTS' });
        }

        const passwordHash = await bcrypt.hash(password, saltRounds);
        const userId = ulid();

        const [result] = await sql.query(
            'INSERT INTO users (id, username, email, passwordHash, ip, country, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
            [
                userId,
                username,
                email,
                passwordHash,
                req.headers['cf-connecting-ip'] || req.ip,
                req.headers['cf-ipcountry'] || null
            ]
        );

        const newUser = {
            id: userId,
            username,
            email,
            perms: 0
        };

        await createUserSeeds(newUser.id);

        // Generate tokens and set cookies for automatic login
        const { accessToken, refreshToken } = await generateTokens(newUser);
        setAuthCookies(res, accessToken, refreshToken);

        return res.status(201).json({ 
            message: 'Signup successful', 
            user: newUser 
        });

    } catch (error) {
        console.error('Signup Error:', formatConsoleError(error));
        if (error.code === 'ER_DUP_ENTRY') { 
             return res.status(409).json({ error: 'USER_EXISTS' });
        }
        res.status(500).json({ error: 'SERVER_ERROR' });
    }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
    try {
        // Get the refresh token from cookies
        const refreshToken = req.cookies.refreshToken;
        
        // If there's a token, revoke it in the database
        if (refreshToken) {
            await revokeRefreshToken(refreshToken);
        }
        
        // Clear cookies
        clearAuthCookies(res);
        
        res.json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout Error:', formatConsoleError(error));
        res.status(500).json({ error: 'LOGOUT_FAILED' });
    }
});

// Get current user info
router.get('/me', authenticate, (req, res) => {
    // User is already authenticated by the middleware
    res.json({ user: req.user });
});

// Refresh token endpoint
router.post('/refresh-token', async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        
        if (!refreshToken) {
            return res.status(401).json({ 
                error: 'UNAUTHENTICATED', 
                message: 'No refresh token provided' 
            });
        }
        
        // This throws an error if token is invalid
        const { accessToken, refreshToken: newRefreshToken } = await refreshTokens(refreshToken);
        
        // Set new cookies
        setAuthCookies(res, accessToken, newRefreshToken);
        
        res.json({ message: 'Token refreshed successfully' });
    } catch (error) {
        console.error('Token refresh error:', formatConsoleError(error));
        
        // Clear cookies on failure
        clearAuthCookies(res);
        
        res.status(401).json({ 
            error: 'INVALID_TOKEN', 
            message: 'Invalid or expired refresh token' 
        });
    }
});

// Revoke all tokens (logout from all devices)
router.post('/revoke-all', authenticate, async (req, res) => {
    try {
        await revokeAllUserTokens(req.user.id);
        
        // Clear current session cookies
        clearAuthCookies(res);
        
        res.json({ message: 'Successfully logged out from all devices' });
    } catch (error) {
        console.error('Token revocation error:', formatConsoleError(error));
        res.status(500).json({ error: 'SERVER_ERROR' });
    }
});

module.exports = router;
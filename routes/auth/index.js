const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { ulid } = require('ulid');

const router = express.Router();

const { sql } = require('../../database');
const { apiLimiter } = require('./functions');
const { formatConsoleError } = require('../../utils');
const { createUserSeeds } = require('../../fairness');

const saltRounds = 10;

router.post('/login', apiLimiter, (req, res, next) => {
    if (!req.body.email || !req.body.password) {
        return res.status(400).json({ error: 'MISSING_CREDENTIALS' });
    }

    passport.authenticate('local', (err, user, info) => {
        if (err) { 
            console.error(formatConsoleError(err));
            return res.status(500).json({ error: 'SERVER_ERROR'}); 
        }
        if (!user) { 
            const errorCode = info.message === 'Account is banned.' ? 'ACCOUNT_BANNED' : 'INVALID_CREDENTIALS';
            return res.status(401).json({ error: errorCode, message: info.message || 'Login failed.' }); 
        }
        
        req.logIn(user, (err) => {
            if (err) { 
                console.error(formatConsoleError(err));
                return res.status(500).json({ error: 'SESSION_ERROR'}); 
            }
            
            const { passwordHash, ...userInfo } = user;
            return res.json({ 
                message: 'Login successful', 
                user: userInfo 
            });
        });
    })(req, res, next);
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

        req.logIn(newUser, (err) => {
            if (err) {
                console.error('Error logging in after signup:', formatConsoleError(err));
                return res.status(201).json({ message: 'Signup successful, but auto-login failed.', user: newUser }); 
            }
            return res.status(201).json({ message: 'Signup successful', user: newUser });
        });

    } catch (error) {
        console.error('Signup Error:', formatConsoleError(error));
        if (error.code === 'ER_DUP_ENTRY') { 
             return res.status(409).json({ error: 'USER_EXISTS' });
        }
        res.status(500).json({ error: 'SERVER_ERROR' });
    }
});

router.post('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { 
            console.error('Logout Error:', formatConsoleError(err));
            return res.status(500).json({ error: 'LOGOUT_FAILED'}); 
        }
        res.json({ message: 'Logout successful' });
    });
});

router.get('/me', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ user: req.user }); 
    } else {
        res.status(401).json({ error: 'UNAUTHENTICATED'});
    }
});

module.exports = router;
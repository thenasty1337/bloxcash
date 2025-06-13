const express = require('express');
const router = express.Router();

const { sql } = require('../../database');
const speakeasy = require('speakeasy');
const { generate2FASecret, verify2FAToken } = require('../../utils/security');

const { isAuthed, apiLimiter, expiresIn, getReqToken } = require('../auth/functions');
const { sendLog } = require('../../utils');

router.use(isAuthed);

const adminRoles = ['ADMIN', 'OWNER', 'DEV'];
const authorizedAdmins = {};

// Store pending 2FA secrets during setup
const pending2FASecrets = {};

router.get('/auth', apiLimiter, async (req, res) => {
    const jwt = getReqToken(req);
    
    if (!authorizedAdmins[jwt]) {
        return res.json({ success: false });
    }

    const authData = authorizedAdmins[jwt];
    const now = Date.now();
    const sessionTimeLeft = Math.max(0, Math.floor((authData.authorizedAt + (30 * 60 * 1000) - now) / 1000));
    
    if (sessionTimeLeft <= 0) {
        delete authorizedAdmins[jwt];
        return res.json({ success: false });
    }

    return res.json({ 
        success: true, 
        sessionTimeLeft: sessionTimeLeft 
    });
});

router.post('/2fa', apiLimiter, async (req, res) => {
    const jwt = getReqToken(req);
    if (authorizedAdmins[jwt]) return res.json({ error: 'ALREADY_AUTHORIZED' });

    const [[user]] = await sql.query('SELECT id, username, 2fa, role FROM users WHERE id = ?', [req.user.id]);
    if (!user || !adminRoles.includes(user.role)) return res.json({ error: 'UNAUTHORIZED' });

    const { token } = req.body;

    // If user doesn't have 2FA set up, generate new secret and QR code
    if (!user['2fa']) {
        // If no token provided, return setup data
        if (!token) {
            try {
                // Always generate a fresh secret for new setup attempts
                const secretData = await generate2FASecret(user.username);
                pending2FASecrets[user.id] = secretData.secret;
                
                console.log(`Generated new 2FA secret for user ${user.id}: ${secretData.secret.substring(0, 8)}...`);

                return res.json({
                    secret: secretData.qrCode, // QR code as data URL
                    manualEntryKey: secretData.manualEntryKey, // Base32 secret for manual entry
                    setupRequired: true
                });
            } catch (error) {
                console.error('Error generating 2FA secret:', error);
                return res.json({ error: 'SETUP_FAILED' });
            }
        } else {
            // User is trying to complete setup with a token
            try {
                const pendingSecret = pending2FASecrets[user.id];
                if (!pendingSecret) {
                    return res.json({ error: 'SETUP_SESSION_EXPIRED' });
                }
                
                console.log(`Verifying setup token for user ${user.id} with secret: ${pendingSecret.substring(0, 8)}...`);
                
                // Verify the token against the pending secret
                const isValid = verify2FAToken(token, pendingSecret);
                
                if (!isValid) {
                    return res.json({ error: 'INVALID_SETUP_TOKEN' });
                }
                
                // Token is valid, save the secret and authorize
                await sql.query('UPDATE users SET 2fa = ? WHERE id = ?', [pendingSecret, req.user.id]);
                
                // Clean up pending secret
                delete pending2FASecrets[user.id];
                
                // Authorize the session
                authorizedAdmins[jwt] = {
                    userId: user.id,
                    authorizedAt: Date.now()
                };

                // Set expiration timer (30 minutes)
                setTimeout(() => {
                    delete authorizedAdmins[jwt];
                }, 1000 * 60 * 30);

                sendLog('admin', `[\`${req.user.id}\`] *${user.username}* completed 2FA setup and logged into admin panel.`);
                return res.json({ success: true, sessionTimeLeft: 30 * 60 });
                
            } catch (error) {
                console.error('Error in 2FA setup:', error);
                return res.json({ error: 'SETUP_FAILED' });
            }
        }
    }

    // User has 2FA set up, verify the token
    if (!token) {
        return res.json({ error: 'TOKEN_REQUIRED' });
    }

    // In production, verify the actual token
    if (process.env.NODE_ENV === 'production') {
        const isValid = verify2FAToken(token, user['2fa']);
        if (!isValid) {
            return res.json({ error: 'INVALID_TOKEN' });
        }
    } else {
        // In development, also check for test token but allow real tokens too
        const isValid = verify2FAToken(token, user['2fa']);
        if (!isValid && token !== '000000') {
            return res.json({ error: 'INVALID_TOKEN' });
        }
    }

    // Token is valid, authorize the session
    authorizedAdmins[jwt] = {
        userId: user.id,
        authorizedAt: Date.now()
    };

    // Set expiration timer (30 minutes)
    setTimeout(() => {
        delete authorizedAdmins[jwt];
    }, 1000 * 60 * 30);

    sendLog('admin', `[\`${req.user.id}\`] *${user.username}* logged into admin panel with 2FA.`);
    return res.json({ success: true, sessionTimeLeft: 30 * 60 });
});

router.get('/unpossess', async (req, res) => {

    if (!req.cookies['admjwt']) return res.redirect('/');
    res.cookie('jwt', req.cookies['admjwt'], { maxAge: expiresIn * 1000 });
    res.clearCookie('admjwt');

    res.redirect('/');

});

router.use(async (req, res, next) => {
    const [[user]] = await sql.query('SELECT id, role, username, perms FROM users WHERE id = ?', [req.user.id]);
    if (!user || !adminRoles.includes(user.role)) return res.json({ error: 'UNAUTHORIZED' });

    const jwt = getReqToken(req);
    const adminSession = authorizedAdmins[jwt];
    
    if (!adminSession) {
        return res.json({ error: '2FA_REQUIRED' });
    }

    // Check if session has expired (30 minutes)
    const sessionAge = Date.now() - adminSession.authorizedAt;
    const maxAge = 30 * 60 * 1000; // 30 minutes
    
    if (sessionAge > maxAge) {
        delete authorizedAdmins[jwt];
        return res.json({ error: 'SESSION_EXPIRED' });
    }

    req.user = user;
    next();
});

const usersRoute = require('./users');
const phrasesRoute = require('./phrases');
const rainRoute = require('./rain');
const featuresRoute = require('./features');
const cashierRoute = require('./cashier');
const statsbookRoute = require('./statsbook');
const dashboardRoute = require('./dashboard');
const casesRoute = require('./cases');
const spinshieldRoute = require('./spinshield');

router.use('/users', usersRoute);
router.use('/phrases', phrasesRoute);
router.use('/rain', rainRoute);
router.use('/features', featuresRoute);
router.use('/cashier', cashierRoute);
router.use('/statsbook', statsbookRoute);
router.use('/dashboard', dashboardRoute);
router.use('/cases', casesRoute);
router.use('/spinshield', spinshieldRoute);

module.exports = router;
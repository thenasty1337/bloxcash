const express = require('express');
const router = express.Router();

const { sql, doTransaction } = require('../../database');
const { isAuthed, apiLimiter } = require('../auth/functions');
const { 
    validatePassword, 
    hashPassword, 
    verifyPassword,
    generate2FASecret,
    verify2FAToken,
    generateBackupCodes,
    verifyBackupCode,
    logSecurityEvent,
    checkRateLimit,
    validateEmail,
    validatePhoneNumber,
    sanitizeInput,
    generateSecureToken,
    generateSMSCode,
    generateDeviceFingerprint
} = require('../../utils/security');

// Get user settings (prioritizing users table for core fields)
router.get('/', isAuthed, async (req, res) => {
    try {
        // Get data from both users table (primary) and user_settings table (secondary)
        const [[userData]] = await sql.query(`
            SELECT email, verified as email_verified, \`2fa\` as two_factor_secret, mentionsEnabled, anon
            FROM users 
            WHERE id = ?
        `, [req.user.id]);

        const [[userSettings]] = await sql.query(`
            SELECT 
                phone, phone_verified, two_factor_enabled,
                session_timeout, email_notifications, sms_notifications, marketing_emails,
                push_notifications, daily_deposit_limit, weekly_withdrawal_limit,
                monthly_loss_limit, self_exclusion_until, reality_check_interval,
                login_notifications, withdrawal_notifications, deposit_notifications,
                bonus_notifications, security_alerts
            FROM user_settings 
            WHERE userId = ?
        `, [req.user.id]);

        // Create default settings if they don't exist
        if (!userSettings) {
            await sql.query(
                'INSERT INTO user_settings (userId, session_timeout) VALUES (?, ?)',
                [req.user.id, 43200] // Default 30 days
            );
            
            // Re-fetch the newly created settings
            const [[newUserSettings]] = await sql.query(`
                SELECT 
                    phone, phone_verified, two_factor_enabled,
                    session_timeout, email_notifications, sms_notifications, marketing_emails,
                    push_notifications, daily_deposit_limit, weekly_withdrawal_limit,
                    monthly_loss_limit, self_exclusion_until, reality_check_interval,
                    login_notifications, withdrawal_notifications, deposit_notifications,
                    bonus_notifications, security_alerts
                FROM user_settings 
                WHERE userId = ?
            `, [req.user.id]);
            userSettings = newUserSettings;
        }

        // Merge data with users table taking priority for core fields
        const mergedSettings = {
            // From users table (primary)
            email: userData?.email || null,
            email_verified: userData?.email_verified || false,
            two_factor_enabled: !!(userData?.two_factor_secret), // Convert 2FA secret to boolean
            mentions_enabled: userData?.mentionsEnabled || false,
            anonymous_mode: userData?.anon || false,
            
            // From user_settings table (secondary/additional features)
            phone: userSettings?.phone || null,
            phone_verified: userSettings?.phone_verified || false,
            session_timeout: userSettings?.session_timeout ?? 43200, // Default 30 days (30 * 24 * 60 minutes) - use nullish coalescing to handle 0 values
            email_notifications: userSettings?.email_notifications !== undefined ? userSettings.email_notifications : true,
            sms_notifications: userSettings?.sms_notifications || false,
            marketing_emails: userSettings?.marketing_emails !== undefined ? userSettings.marketing_emails : true,
            push_notifications: userSettings?.push_notifications !== undefined ? userSettings.push_notifications : true,
            daily_deposit_limit: userSettings?.daily_deposit_limit || null,
            weekly_withdrawal_limit: userSettings?.weekly_withdrawal_limit || null,
            monthly_loss_limit: userSettings?.monthly_loss_limit || null,
            self_exclusion_until: userSettings?.self_exclusion_until || null,
            reality_check_interval: userSettings?.reality_check_interval || null,
            login_notifications: userSettings?.login_notifications !== undefined ? userSettings.login_notifications : true,
            withdrawal_notifications: userSettings?.withdrawal_notifications !== undefined ? userSettings.withdrawal_notifications : true,
            deposit_notifications: userSettings?.deposit_notifications !== undefined ? userSettings.deposit_notifications : true,
            bonus_notifications: userSettings?.bonus_notifications !== undefined ? userSettings.bonus_notifications : true,
            security_alerts: userSettings?.security_alerts !== undefined ? userSettings.security_alerts : true
        };

        res.json(mergedSettings);
    } catch (error) {
        console.error('Error fetching user settings:', error);
        res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
});

// Update email address
router.post('/email', [isAuthed, apiLimiter], async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || typeof email !== 'string') {
            return res.status(400).json({ error: 'INVALID_EMAIL' });
        }

        const sanitizedEmail = sanitizeInput(email.toLowerCase());
        if (!validateEmail(sanitizedEmail)) {
            return res.status(400).json({ error: 'INVALID_EMAIL_FORMAT' });
        }

        // Check rate limiting
        if (!checkRateLimit(`email_change_${req.user.id}`, 3, 60 * 60 * 1000)) {
            return res.status(429).json({ error: 'TOO_MANY_ATTEMPTS' });
        }

        // Check if email is already in use
        const [[existingUser]] = await sql.query(
            'SELECT id FROM users WHERE email = ? AND id != ?',
            [sanitizedEmail, req.user.id]
        );

        if (existingUser) {
            return res.status(400).json({ error: 'EMAIL_ALREADY_IN_USE' });
        }

        await doTransaction(async (connection, commit) => {
            // Update user email
            await connection.query(
                'UPDATE users SET email = ? WHERE id = ?',
                [sanitizedEmail, req.user.id]
            );

            // Update settings
            await connection.query(`
                INSERT INTO user_settings (userId, email, email_verified) 
                VALUES (?, ?, 0)
                ON DUPLICATE KEY UPDATE 
                email = VALUES(email), 
                email_verified = 0
            `, [req.user.id, sanitizedEmail]);

            // Generate verification token
            const token = generateSecureToken();
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

            await connection.query(`
                INSERT INTO email_verification_tokens (userId, email, token, expires_at)
                VALUES (?, ?, ?, ?)
            `, [req.user.id, sanitizedEmail, token, expiresAt]);

            await commit();
        });

        await logSecurityEvent(req.user.id, 'email_change', `Email changed to ${sanitizedEmail}`, req);

        // TODO: Send verification email
        res.json({ 
            success: true, 
            message: 'Email updated successfully. Please check your inbox for verification.' 
        });

    } catch (error) {
        console.error('Error updating email:', error);
        res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
});

// Update phone number
router.post('/phone', [isAuthed, apiLimiter], async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone || typeof phone !== 'string') {
            return res.status(400).json({ error: 'INVALID_PHONE' });
        }

        const cleanPhone = phone.replace(/\D/g, '');
        if (!validatePhoneNumber(cleanPhone)) {
            return res.status(400).json({ error: 'INVALID_PHONE_FORMAT' });
        }

        // Check rate limiting
        if (!checkRateLimit(`phone_change_${req.user.id}`, 3, 60 * 60 * 1000)) {
            return res.status(429).json({ error: 'TOO_MANY_ATTEMPTS' });
        }

        await doTransaction(async (connection, commit) => {
            // Update settings
            await connection.query(`
                INSERT INTO user_settings (userId, phone, phone_verified) 
                VALUES (?, ?, 0)
                ON DUPLICATE KEY UPDATE 
                phone = VALUES(phone), 
                phone_verified = 0
            `, [req.user.id, cleanPhone]);

            // Generate SMS verification code
            const code = generateSMSCode();
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

            await connection.query(`
                INSERT INTO phone_verification_tokens (userId, phone, token, expires_at)
                VALUES (?, ?, ?, ?)
            `, [req.user.id, cleanPhone, code, expiresAt]);

            await commit();
        });

        await logSecurityEvent(req.user.id, 'phone_change', `Phone number changed to ${cleanPhone}`, req);

        // TODO: Send SMS verification
        res.json({ 
            success: true, 
            message: 'Phone number updated successfully. Please check your SMS for verification code.' 
        });

    } catch (error) {
        console.error('Error updating phone:', error);
        res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
});

// Change password
router.post('/password', [isAuthed, apiLimiter], async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'MISSING_FIELDS' });
        }

        // Check rate limiting
        if (!checkRateLimit(`password_change_${req.user.id}`, 5, 60 * 60 * 1000)) {
            return res.status(429).json({ error: 'TOO_MANY_ATTEMPTS' });
        }

        // Validate new password
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.valid) {
            return res.status(400).json({ 
                error: 'WEAK_PASSWORD', 
                details: passwordValidation.errors 
            });
        }

        const [[user]] = await sql.query(
            'SELECT passwordHash FROM users WHERE id = ?',
            [req.user.id]
        );

        if (!user) {
            return res.status(404).json({ error: 'USER_NOT_FOUND' });
        }

        // Verify current password
        const isValidPassword = await verifyPassword(currentPassword, user.passwordHash);
        if (!isValidPassword) {
            await logSecurityEvent(req.user.id, 'password_change_failed', 'Incorrect current password provided', req);
            return res.status(400).json({ error: 'INVALID_CURRENT_PASSWORD' });
        }

        // Hash new password
        const newPasswordHash = await hashPassword(newPassword);

        await doTransaction(async (connection, commit) => {
            // Update password
            await connection.query(
                'UPDATE users SET passwordHash = ? WHERE id = ?',
                [newPasswordHash, req.user.id]
            );

            // Update settings
            await connection.query(`
                INSERT INTO user_settings (userId, last_password_change) 
                VALUES (?, NOW())
                ON DUPLICATE KEY UPDATE 
                last_password_change = NOW()
            `, [req.user.id]);

            await commit();
        });

        await logSecurityEvent(req.user.id, 'password_change', 'Password changed successfully', req);

        res.json({ success: true, message: 'Password changed successfully' });

    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
});

// Enable 2FA - Step 1: Generate secret
router.post('/2fa/setup', [isAuthed, apiLimiter], async (req, res) => {
    try {
        // Check rate limiting
        if (!checkRateLimit(`2fa_setup_${req.user.id}`, 3, 60 * 60 * 1000)) {
            return res.status(429).json({ error: 'TOO_MANY_ATTEMPTS' });
        }

        const [[user]] = await sql.query(
            'SELECT username FROM users WHERE id = ?',
            [req.user.id]
        );

        if (!user) {
            return res.status(404).json({ error: 'USER_NOT_FOUND' });
        }

        const { secret, qrCode } = await generate2FASecret(user.username);

        // Store temporary secret in session or cache (not in database yet)
        req.session.temp2FASecret = secret;

        res.json({
            secret: secret,
            qrCode: qrCode,
            message: 'Scan the QR code with your authenticator app, then verify with a code'
        });

    } catch (error) {
        console.error('Error setting up 2FA:', error);
        res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
});

// Enable 2FA - Step 2: Verify and enable
router.post('/2fa/enable', [isAuthed, apiLimiter], async (req, res) => {
    try {
        const { token } = req.body;

        if (!token || typeof token !== 'string' || token.length !== 6) {
            return res.status(400).json({ error: 'INVALID_TOKEN' });
        }

        const tempSecret = req.session.temp2FASecret;
        if (!tempSecret) {
            return res.status(400).json({ error: 'NO_SETUP_IN_PROGRESS' });
        }

        // Verify the token
        const isValid = verify2FAToken(token, tempSecret);
        if (!isValid) {
            return res.status(400).json({ error: 'INVALID_2FA_TOKEN' });
        }

        // Generate backup codes
        const backupCodes = generateBackupCodes();
        const backupCodesWithStatus = backupCodes.map(code => ({ code, used: false }));

        await doTransaction(async (connection, commit) => {
            // Save 2FA secret to users table (primary location)
            await connection.query(
                'UPDATE users SET `2fa` = ? WHERE id = ?',
                [tempSecret, req.user.id]
            );

            // Also update user_settings for backup codes and enable flag
            await connection.query(`
                INSERT INTO user_settings (userId, two_factor_enabled, backup_codes) 
                VALUES (?, 1, ?)
                ON DUPLICATE KEY UPDATE 
                two_factor_enabled = 1, 
                backup_codes = VALUES(backup_codes)
            `, [req.user.id, JSON.stringify(backupCodesWithStatus)]);

            await commit();
        });

        // Clear temporary secret
        delete req.session.temp2FASecret;

        await logSecurityEvent(req.user.id, '2fa_enabled', '2FA authentication enabled', req);

        res.json({
            success: true,
            backupCodes: backupCodes,
            message: '2FA enabled successfully. Save these backup codes in a secure location.'
        });

    } catch (error) {
        console.error('Error enabling 2FA:', error);
        res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
});

// Disable 2FA
router.post('/2fa/disable', [isAuthed, apiLimiter], async (req, res) => {
    try {
        const { password, token } = req.body;

        if (!password) {
            return res.status(400).json({ error: 'PASSWORD_REQUIRED' });
        }

        // Check rate limiting
        if (!checkRateLimit(`2fa_disable_${req.user.id}`, 3, 60 * 60 * 1000)) {
            return res.status(429).json({ error: 'TOO_MANY_ATTEMPTS' });
        }

        const [[user]] = await sql.query(
            'SELECT passwordHash FROM users WHERE id = ?',
            [req.user.id]
        );

        if (!user) {
            return res.status(404).json({ error: 'USER_NOT_FOUND' });
        }

        // Verify password
        const isValidPassword = await verifyPassword(password, user.passwordHash);
        if (!isValidPassword) {
            return res.status(400).json({ error: 'INVALID_PASSWORD' });
        }

        // Get current 2FA settings from users table (primary) and user_settings (backup codes)
        const [[userData]] = await sql.query(
            'SELECT `2fa` as two_factor_secret FROM users WHERE id = ?',
            [req.user.id]
        );

        if (!userData || !userData.two_factor_secret) {
            return res.status(400).json({ error: '2FA_NOT_ENABLED' });
        }

        // Verify 2FA token if provided, or allow backup code
        if (token) {
            const isValidToken = verify2FAToken(token, userData.two_factor_secret) || 
                                 await verifyBackupCode(req.user.id, token);
            
            if (!isValidToken) {
                return res.status(400).json({ error: 'INVALID_2FA_TOKEN' });
            }
        } else {
            return res.status(400).json({ error: 'TOKEN_REQUIRED' });
        }

        await doTransaction(async (connection, commit) => {
            // Remove 2FA secret from users table (primary location)
            await connection.query(
                'UPDATE users SET `2fa` = NULL WHERE id = ?',
                [req.user.id]
            );

            // Also disable in user_settings and clear backup codes
            await connection.query(`
                UPDATE user_settings 
                SET two_factor_enabled = 0, backup_codes = NULL 
                WHERE userId = ?
            `, [req.user.id]);

            await commit();
        });

        await logSecurityEvent(req.user.id, '2fa_disabled', '2FA authentication disabled', req);

        res.json({ success: true, message: '2FA disabled successfully' });

    } catch (error) {
        console.error('Error disabling 2FA:', error);
        res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
});

// Update notification preferences
router.post('/notifications', [isAuthed, apiLimiter], async (req, res) => {
    try {
        const {
            email_notifications,
            sms_notifications,
            marketing_emails,
            push_notifications,
            login_notifications,
            withdrawal_notifications,
            deposit_notifications,
            bonus_notifications,
            security_alerts
        } = req.body;

        const updates = {};
        const validBooleanFields = [
            'email_notifications', 'sms_notifications', 'marketing_emails', 
            'push_notifications', 'login_notifications', 'withdrawal_notifications',
            'deposit_notifications', 'bonus_notifications', 'security_alerts'
        ];

        // Validate and prepare updates
        for (const field of validBooleanFields) {
            if (req.body.hasOwnProperty(field)) {
                if (typeof req.body[field] !== 'boolean') {
                    return res.status(400).json({ error: `INVALID_${field.toUpperCase()}` });
                }
                updates[field] = req.body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'NO_VALID_UPDATES' });
        }

        // Build dynamic query
        const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updates);

        await sql.query(`
            INSERT INTO user_settings (userId, ${Object.keys(updates).join(', ')}) 
            VALUES (?, ${Object.keys(updates).map(() => '?').join(', ')})
            ON DUPLICATE KEY UPDATE ${setClause}
        `, [req.user.id, ...values, ...values]);

        await logSecurityEvent(req.user.id, 'notification_settings_changed', 'Notification preferences updated', req);

        res.json({ success: true, message: 'Notification preferences updated successfully' });

    } catch (error) {
        console.error('Error updating notifications:', error);
        res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
});

// Update financial limits and session settings
router.post('/limits', [isAuthed, apiLimiter], async (req, res) => {
    try {
        const {
            daily_deposit_limit,
            weekly_withdrawal_limit,
            monthly_loss_limit,
            reality_check_interval,
            session_timeout
        } = req.body;

        const updates = {};

        // Validate daily deposit limit
        if (daily_deposit_limit !== undefined) {
            if (daily_deposit_limit !== null && (typeof daily_deposit_limit !== 'number' || daily_deposit_limit < 0)) {
                return res.status(400).json({ error: 'INVALID_DEPOSIT_LIMIT' });
            }
            updates.daily_deposit_limit = daily_deposit_limit;
        }

        // Validate weekly withdrawal limit
        if (weekly_withdrawal_limit !== undefined) {
            if (weekly_withdrawal_limit !== null && (typeof weekly_withdrawal_limit !== 'number' || weekly_withdrawal_limit < 0)) {
                return res.status(400).json({ error: 'INVALID_WITHDRAWAL_LIMIT' });
            }
            updates.weekly_withdrawal_limit = weekly_withdrawal_limit;
        }

        // Validate monthly loss limit
        if (monthly_loss_limit !== undefined) {
            if (monthly_loss_limit !== null && (typeof monthly_loss_limit !== 'number' || monthly_loss_limit < 0)) {
                return res.status(400).json({ error: 'INVALID_LOSS_LIMIT' });
            }
            updates.monthly_loss_limit = monthly_loss_limit;
        }

        // Validate reality check interval
        if (reality_check_interval !== undefined) {
            console.log('Reality check interval received:', reality_check_interval, 'Type:', typeof reality_check_interval); // Debug log
            if (reality_check_interval !== null && (typeof reality_check_interval !== 'number' || reality_check_interval < 5)) {
                return res.status(400).json({ error: 'INVALID_REALITY_CHECK_INTERVAL' });
            }
            updates.reality_check_interval = reality_check_interval;
        }

        // Validate session timeout
        if (session_timeout !== undefined) {
            const validTimeouts = [30, 120, 1440, 10080, 43200]; // 30min, 2h, 1d, 7d, 30d in minutes
            if (typeof session_timeout !== 'number' || !validTimeouts.includes(session_timeout)) {
                return res.status(400).json({ error: 'INVALID_SESSION_TIMEOUT' });
            }
            updates.session_timeout = session_timeout;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'NO_VALID_UPDATES' });
        }

        // Build dynamic query
        const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updates);

        await sql.query(`
            INSERT INTO user_settings (userId, ${Object.keys(updates).join(', ')}) 
            VALUES (?, ${Object.keys(updates).map(() => '?').join(', ')})
            ON DUPLICATE KEY UPDATE ${setClause}
        `, [req.user.id, ...values, ...values]);

        await logSecurityEvent(req.user.id, 'financial_limits_changed', 'Financial limits updated', req);

        res.json({ success: true, message: 'Financial limits updated successfully' });

    } catch (error) {
        console.error('Error updating financial limits:', error);
        res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
});

// Get security logs
router.get('/security-logs', isAuthed, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const offset = (page - 1) * limit;

        const [[{ total }]] = await sql.query(
            'SELECT COUNT(*) as total FROM security_logs WHERE userId = ?',
            [req.user.id]
        );

        const [logs] = await sql.query(`
            SELECT event_type, description, ip_address, user_agent, createdAt
            FROM security_logs 
            WHERE userId = ? 
            ORDER BY createdAt DESC 
            LIMIT ? OFFSET ?
        `, [req.user.id, limit, offset]);

        res.json({
            logs: logs,
            pagination: {
                current_page: page,
                total_pages: Math.ceil(total / limit),
                total_items: total,
                items_per_page: limit
            }
        });

    } catch (error) {
        console.error('Error fetching security logs:', error);
        res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
});

module.exports = router; 
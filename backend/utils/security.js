const crypto = require('crypto');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const bcrypt = require('bcrypt');
const { sql } = require('../database');
const { sendLog } = require('../utils');

// Security configuration
const SECURITY_CONFIG = {
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_REQUIRE_UPPERCASE: true,
    PASSWORD_REQUIRE_LOWERCASE: true,
    PASSWORD_REQUIRE_NUMBERS: true,
    PASSWORD_REQUIRE_SYMBOLS: false,
    MAX_LOGIN_ATTEMPTS: 5,
    ACCOUNT_LOCK_DURATION: 15 * 60 * 1000, // 15 minutes
    TOKEN_EXPIRY: {
        PASSWORD_RESET: 60 * 60 * 1000, // 1 hour
        EMAIL_VERIFICATION: 24 * 60 * 60 * 1000, // 24 hours
        PHONE_VERIFICATION: 5 * 60 * 1000, // 5 minutes
    },
    MAX_SMS_ATTEMPTS: 3,
    BACKUP_CODES_COUNT: 10,
};

/**
 * Validate password strength
 */
function validatePassword(password) {
    const errors = [];
    
    if (password.length < SECURITY_CONFIG.PASSWORD_MIN_LENGTH) {
        errors.push(`Password must be at least ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} characters long`);
    }
    
    if (SECURITY_CONFIG.PASSWORD_REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    
    if (SECURITY_CONFIG.PASSWORD_REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    
    if (SECURITY_CONFIG.PASSWORD_REQUIRE_NUMBERS && !/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    
    if (SECURITY_CONFIG.PASSWORD_REQUIRE_SYMBOLS && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one symbol');
    }
    
    // Check for common weak passwords
    const commonPasswords = ['password', '123456', 'password123', 'admin', 'qwerty'];
    if (commonPasswords.includes(password.toLowerCase())) {
        errors.push('Password is too common and easily guessable');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Hash password securely
 */
async function hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
}

/**
 * Verify password against hash
 */
async function verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

/**
 * Generate secure random token
 */
function generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate numeric code for SMS verification
 */
function generateSMSCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate 2FA secret and QR code
 */
async function generate2FASecret(username) {
    const secret = speakeasy.generateSecret({
        name: `Nova Casino (${username})`,
        issuer: 'Nova Casino',
        length: 32
    });
    
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
    
    return {
        secret: secret.base32,
        qrCode: qrCodeUrl,
        manualEntryKey: secret.base32
    };
}

/**
 * Verify 2FA token
 */
function verify2FAToken(token, secret) {
    return speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 2 // Allow 2 time steps tolerance
    });
}

/**
 * Generate backup codes for 2FA
 */
function generateBackupCodes() {
    const codes = [];
    for (let i = 0; i < SECURITY_CONFIG.BACKUP_CODES_COUNT; i++) {
        codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
}

/**
 * Verify backup code
 */
async function verifyBackupCode(userId, code) {
    const [[userSettings]] = await sql.query(
        'SELECT backup_codes FROM user_settings WHERE userId = ?',
        [userId]
    );
    
    if (!userSettings || !userSettings.backup_codes) {
        return false;
    }
    
    const backupCodes = JSON.parse(userSettings.backup_codes);
    const codeIndex = backupCodes.findIndex(c => c.code === code.toUpperCase() && !c.used);
    
    if (codeIndex === -1) {
        return false;
    }
    
    // Mark code as used
    backupCodes[codeIndex].used = true;
    await sql.query(
        'UPDATE user_settings SET backup_codes = ? WHERE userId = ?',
        [JSON.stringify(backupCodes), userId]
    );
    
    return true;
}

/**
 * Log security event
 */
async function logSecurityEvent(userId, eventType, description, req = null) {
    try {
        const metadata = {
            timestamp: Date.now()
        };
        
        if (req) {
            metadata.method = req.method;
            metadata.url = req.url;
            metadata.headers = {
                'user-agent': req.get('User-Agent'),
                'accept-language': req.get('Accept-Language')
            };
        }
        
        await sql.query(
            `INSERT INTO security_logs (userId, event_type, description, ip_address, user_agent, metadata) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                userId,
                eventType,
                description,
                req ? req.ip : null,
                req ? req.get('User-Agent') : null,
                JSON.stringify(metadata)
            ]
        );
        
        // Send critical events to Discord/Slack
        if (['password_change', 'email_change', '2fa_disabled', 'suspicious_login'].includes(eventType)) {
            sendLog('security', `🔒 Security Event: ${description} - User: ${userId}`);
        }
    } catch (error) {
        console.error('Failed to log security event:', error);
    }
}

/**
 * Check if account is locked
 */
async function isAccountLocked(userId) {
    const [[user]] = await sql.query(
        'SELECT accountLock FROM users WHERE id = ?',
        [userId]
    );
    
    return user ? user.accountLock : false;
}

/**
 * Lock/unlock account
 */
async function setAccountLock(userId, locked, reason = '') {
    await sql.query(
        'UPDATE users SET accountLock = ? WHERE id = ?',
        [locked ? 1 : 0, userId]
    );
    
    await logSecurityEvent(
        userId, 
        locked ? 'account_locked' : 'account_unlocked', 
        `Account ${locked ? 'locked' : 'unlocked'}${reason ? ': ' + reason : ''}`
    );
}

/**
 * Rate limiting for sensitive operations
 */
const rateLimits = new Map();

function checkRateLimit(key, maxAttempts, windowMs) {
    const now = Date.now();
    const attempts = rateLimits.get(key) || [];
    
    // Remove expired attempts
    const validAttempts = attempts.filter(time => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
        return false;
    }
    
    validAttempts.push(now);
    rateLimits.set(key, validAttempts);
    
    return true;
}

/**
 * Validate email format
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number format
 */
function validatePhoneNumber(phone) {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check if it's a valid length (10-15 digits)
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
        return false;
    }
    
    return true;
}

/**
 * Sanitize input to prevent XSS
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
        .replace(/[<>]/g, '') // Remove angle brackets
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .trim();
}

/**
 * Check if device is trusted
 */
async function isTrustedDevice(userId, deviceId) {
    const [[device]] = await sql.query(
        'SELECT trusted FROM trusted_devices WHERE userId = ? AND device_id = ?',
        [userId, deviceId]
    );
    
    return device ? device.trusted : false;
}

/**
 * Generate device fingerprint
 */
function generateDeviceFingerprint(req) {
    const components = [
        req.get('User-Agent') || '',
        req.get('Accept-Language') || '',
        req.get('Accept-Encoding') || '',
        req.ip || ''
    ];
    
    return crypto.createHash('sha256')
        .update(components.join('|'))
        .digest('hex');
}

module.exports = {
    SECURITY_CONFIG,
    validatePassword,
    hashPassword,
    verifyPassword,
    generateSecureToken,
    generateSMSCode,
    generate2FASecret,
    verify2FAToken,
    generateBackupCodes,
    verifyBackupCode,
    logSecurityEvent,
    isAccountLocked,
    setAccountLock,
    checkRateLimit,
    validateEmail,
    validatePhoneNumber,
    sanitizeInput,
    isTrustedDevice,
    generateDeviceFingerprint
}; 
# User Settings Migration Guide

This document explains how to set up the new user settings functionality for BloxCash.

## Overview

The user settings system provides comprehensive account management, security, and preference controls including:

- **Account Information**: Email/phone management with verification
- **Security & Privacy**: 2FA, password changes, session management
- **Notifications**: Email, SMS, push notification preferences  
- **Financial Settings**: Deposit/withdrawal limits, responsible gambling tools
- **Security Logging**: Complete audit trail of security events

## Installation Steps

### 1. Install Dependencies

```bash
cd backend
npm install qrcode
```

### 2. Run Database Migration

Execute the migration script to create the required tables:

```sql
-- Run this in your MySQL client
source user_settings.sql
```

Or manually execute:

```bash
mysql -u your_username -p your_database < user_settings.sql
```

### 3. Verify Tables Created

The migration creates these tables:
- `user_settings` - Extended user preferences and settings
- `security_logs` - Security event audit trail  
- `password_reset_tokens` - Secure password reset tokens
- `email_verification_tokens` - Email verification tokens
- `phone_verification_tokens` - SMS verification tokens
- `trusted_devices` - Device management and trust

### 4. Update Frontend Settings Component

The settings component should now connect to the new backend endpoints:

```javascript
// Example API calls
await authedAPI('/user/settings', 'GET') // Get user settings
await authedAPI('/user/settings/email', 'POST', { email: 'new@email.com' })
await authedAPI('/user/settings/2fa/setup', 'POST') // Setup 2FA
```

## Security Features

### Password Security
- Configurable password requirements
- Secure bcrypt hashing with salt rounds
- Password strength validation
- Protection against common passwords

### Two-Factor Authentication (2FA)
- TOTP-based authentication using speakeasy
- QR code generation for easy setup
- Backup codes for account recovery
- Secure secret storage

### Rate Limiting
- Prevents brute force attacks
- Configurable limits per operation
- Per-user rate limiting

### Security Logging
- Comprehensive audit trail
- IP address and user agent tracking
- Critical event notifications
- Tamper-evident logs

### Device Management
- Device fingerprinting
- Trusted device tracking
- Suspicious login detection

## API Endpoints

### Settings Management
- `GET /user/settings` - Get user settings
- `POST /user/settings/email` - Update email address
- `POST /user/settings/phone` - Update phone number
- `POST /user/settings/password` - Change password
- `POST /user/settings/notifications` - Update notification preferences
- `POST /user/settings/limits` - Update financial limits

### Two-Factor Authentication
- `POST /user/settings/2fa/setup` - Generate 2FA secret and QR code
- `POST /user/settings/2fa/enable` - Enable 2FA with token verification
- `POST /user/settings/2fa/disable` - Disable 2FA (requires password + token)

### Security
- `GET /user/settings/security-logs` - Get security event history

## Security Configuration

The security configuration can be customized in `utils/security.js`:

```javascript
const SECURITY_CONFIG = {
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_REQUIRE_UPPERCASE: true,
    PASSWORD_REQUIRE_LOWERCASE: true,
    PASSWORD_REQUIRE_NUMBERS: true,
    PASSWORD_REQUIRE_SYMBOLS: false,
    MAX_LOGIN_ATTEMPTS: 5,
    ACCOUNT_LOCK_DURATION: 15 * 60 * 1000, // 15 minutes
    // ... other settings
};
```

## Responsible Gambling Features

The system includes several responsible gambling tools:

- **Daily Deposit Limits**: Users can set maximum daily deposits
- **Weekly Withdrawal Limits**: Control maximum weekly withdrawals  
- **Monthly Loss Limits**: Track and limit monthly losses
- **Reality Check**: Periodic time reminders during gameplay
- **Self-Exclusion**: Temporary account restrictions (future feature)

## Integration with Existing Features

### Email/SMS Services
You'll need to integrate with email and SMS providers for:
- Email verification tokens
- SMS verification codes
- Security alert notifications
- Password reset emails

### Session Management
The system integrates with existing session handling for:
- Session timeout enforcement
- Device tracking
- Login notifications

### Financial Limits
Integration points with existing financial systems:
- Deposit limit checking
- Withdrawal limit enforcement
- Loss tracking and limits

## Error Handling

All endpoints include comprehensive error handling with specific error codes:
- Input validation errors
- Rate limiting responses
- Security violation alerts
- Database transaction failures

## Testing

Test the implementation with:

1. **Settings Management**: Update various user preferences
2. **2FA Flow**: Complete setup and verification process
3. **Security Events**: Verify logging of security events
4. **Rate Limiting**: Test rate limit enforcement
5. **Financial Limits**: Test limit validation and enforcement

## Monitoring

Monitor these metrics for security:
- Failed login attempts
- 2FA setup/disable events
- Password change frequency
- Suspicious login patterns
- Rate limit violations

## Future Enhancements

Planned future features:
- Email/SMS verification implementation
- Advanced device fingerprinting
- Geolocation-based security
- Machine learning fraud detection
- Advanced self-exclusion tools 
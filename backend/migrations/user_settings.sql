-- User Settings Migration SQL Script
-- Run this to create user_settings table for extended user preferences

-- Create user_settings table for extended user preferences
CREATE TABLE IF NOT EXISTS `user_settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` CHAR(26) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `phone_verified` tinyint(1) NOT NULL DEFAULT '0',
  `email_verified` tinyint(1) NOT NULL DEFAULT '0',
  `two_factor_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `two_factor_secret` varchar(255) DEFAULT NULL,
  `backup_codes` json DEFAULT NULL,
  `session_timeout` int NOT NULL DEFAULT '30',
  `email_notifications` tinyint(1) NOT NULL DEFAULT '1',
  `sms_notifications` tinyint(1) NOT NULL DEFAULT '0',
  `marketing_emails` tinyint(1) NOT NULL DEFAULT '1',
  `push_notifications` tinyint(1) NOT NULL DEFAULT '1',
  `daily_deposit_limit` decimal(20,8) DEFAULT NULL,
  `weekly_withdrawal_limit` decimal(20,8) DEFAULT NULL,
  `monthly_loss_limit` decimal(20,8) DEFAULT NULL,
  `self_exclusion_until` timestamp NULL DEFAULT NULL,
  `reality_check_interval` int DEFAULT NULL, -- minutes
  `last_password_change` timestamp NULL DEFAULT NULL,
  `login_notifications` tinyint(1) NOT NULL DEFAULT '1',
  `withdrawal_notifications` tinyint(1) NOT NULL DEFAULT '1',
  `deposit_notifications` tinyint(1) NOT NULL DEFAULT '1',
  `bonus_notifications` tinyint(1) NOT NULL DEFAULT '1',
  `security_alerts` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `userId_unique` (`userId`),
  KEY `email_idx` (`email`),
  KEY `phone_idx` (`phone`),
  CONSTRAINT `fk_user_settings_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create security_logs table for tracking security events
CREATE TABLE IF NOT EXISTS `security_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` CHAR(26) NOT NULL,
  `event_type` varchar(50) NOT NULL,
  `description` text NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `userId_event_idx` (`userId`, `event_type`),
  KEY `createdAt_idx` (`createdAt`),
  CONSTRAINT `fk_security_logs_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create password_reset_tokens table for secure password resets
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` CHAR(26) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `used` tinyint(1) NOT NULL DEFAULT '0',
  `ip_address` varchar(45) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token_unique` (`token`),
  KEY `userId_idx` (`userId`),
  KEY `expires_at_idx` (`expires_at`),
  CONSTRAINT `fk_password_reset_tokens_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create email_verification_tokens table for email verification
CREATE TABLE IF NOT EXISTS `email_verification_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` CHAR(26) NOT NULL,
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `used` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token_unique` (`token`),
  KEY `userId_idx` (`userId`),
  KEY `expires_at_idx` (`expires_at`),
  CONSTRAINT `fk_email_verification_tokens_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create phone_verification_tokens table for SMS verification
CREATE TABLE IF NOT EXISTS `phone_verification_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` CHAR(26) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `token` varchar(6) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `attempts` int NOT NULL DEFAULT '0',
  `used` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `userId_phone_idx` (`userId`, `phone`),
  KEY `expires_at_idx` (`expires_at`),
  CONSTRAINT `fk_phone_verification_tokens_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create trusted_devices table for device management
CREATE TABLE IF NOT EXISTS `trusted_devices` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` CHAR(26) NOT NULL,
  `device_id` varchar(255) NOT NULL,
  `device_name` varchar(100) DEFAULT NULL,
  `device_type` varchar(50) DEFAULT NULL,
  `browser` varchar(100) DEFAULT NULL,
  `os` varchar(100) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `last_used` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `trusted` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `userId_device_unique` (`userId`, `device_id`),
  KEY `last_used_idx` (`last_used`),
  CONSTRAINT `fk_trusted_devices_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert default settings for existing users
INSERT IGNORE INTO `user_settings` (`userId`)
SELECT `id` FROM `users`; 
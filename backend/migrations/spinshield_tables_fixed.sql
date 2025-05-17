-- SpinShield Tables Migration SQL Script (Fixed for ULID)
-- Run this directly in your MySQL client

-- Create spinshield_settings table for API credentials and configuration
CREATE TABLE IF NOT EXISTS spinshield_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    api_login VARCHAR(255) NOT NULL,
    api_password VARCHAR(255) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    callback_url VARCHAR(255) NOT NULL,
    `salt_key` VARCHAR(255) NOT NULL,
    active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create spinshield_games table to store game list
CREATE TABLE IF NOT EXISTS spinshield_games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    game_id INT NOT NULL,
    game_id_hash VARCHAR(255) NOT NULL,
    game_name VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    provider_name VARCHAR(255) NULL,
    `type` VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    subcategory VARCHAR(255) NULL,
    is_new BOOLEAN DEFAULT FALSE,
    is_mobile BOOLEAN DEFAULT TRUE,
    freerounds_supported BOOLEAN DEFAULT FALSE,
    featurebuy_supported BOOLEAN DEFAULT FALSE,
    has_jackpot BOOLEAN DEFAULT FALSE,
    play_for_fun_supported BOOLEAN DEFAULT TRUE,
    image_url VARCHAR(512) NULL,
    image_square VARCHAR(512) NULL,
    image_portrait VARCHAR(512) NULL,
    image_long VARCHAR(512) NULL,
    source VARCHAR(255) NULL,
    `system` VARCHAR(255) NULL,
    `timestamp` INT NULL,
    rtp DECIMAL(5,2) NULL,
    active BOOLEAN DEFAULT TRUE,
    external_created_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_game_id_hash (game_id_hash)
);

-- Create spinshield_sessions table to track game sessions
CREATE TABLE IF NOT EXISTS spinshield_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id CHAR(26) NOT NULL,
    game_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    play_for_fun BOOLEAN DEFAULT FALSE,
    is_demo BOOLEAN DEFAULT FALSE,
    game_url TEXT NOT NULL,
    status ENUM('active', 'completed', 'expired') DEFAULT 'active',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_session_id (session_id)
);

-- Create spinshield_transactions table to track all transactions
CREATE TABLE IF NOT EXISTS spinshield_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id CHAR(26) NOT NULL,
    session_id VARCHAR(255) NULL,
    game_id VARCHAR(255) NOT NULL,
    round_id VARCHAR(255) NULL,
    call_id VARCHAR(255) NOT NULL,
    `action` ENUM('balance', 'debit', 'credit') NOT NULL,
    amount INT NOT NULL DEFAULT 0,
    balance_before INT NOT NULL,
    balance_after INT NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    `type` VARCHAR(50) NULL,
    gameplay_final BOOLEAN DEFAULT FALSE,
    is_freespin BOOLEAN DEFAULT FALSE,
    freespin_id INT NULL,
    `timestamp` VARCHAR(20) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_call_id (call_id)
);

-- Create spinshield_freespins table to track free spins
CREATE TABLE IF NOT EXISTS spinshield_freespins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id CHAR(26) NOT NULL,
    game_id VARCHAR(255) NOT NULL,
    freespins_count INT NOT NULL,
    freespins_performed INT NOT NULL DEFAULT 0,
    bet_level INT NOT NULL DEFAULT 0,
    freespins_bet INT NULL,
    freespins_wallet INT NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    active BOOLEAN DEFAULT TRUE,
    valid_until TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

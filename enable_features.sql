-- SQL script to enable all features in BloxCash

-- First, make sure the features table exists (should be created in schema.sql)
-- This handles cases where a feature doesn't already exist in the table

-- Game features
INSERT INTO features (id, enabled, description) VALUES 
('mines', TRUE, 'Mines game') 
ON DUPLICATE KEY UPDATE enabled = TRUE;

INSERT INTO features (id, enabled, description) VALUES 
('roulette', TRUE, 'Roulette game') 
ON DUPLICATE KEY UPDATE enabled = TRUE;

INSERT INTO features (id, enabled, description) VALUES 
('coinflip', TRUE, 'Coinflip game') 
ON DUPLICATE KEY UPDATE enabled = TRUE;

INSERT INTO features (id, enabled, description) VALUES 
('jackpot', TRUE, 'Jackpot game') 
ON DUPLICATE KEY UPDATE enabled = TRUE;

INSERT INTO features (id, enabled, description) VALUES 
('crash', TRUE, 'Crash game') 
ON DUPLICATE KEY UPDATE enabled = TRUE;

INSERT INTO features (id, enabled, description) VALUES 
('blackjack', TRUE, 'Blackjack game') 
ON DUPLICATE KEY UPDATE enabled = TRUE;

INSERT INTO features (id, enabled, description) VALUES 
('slots', TRUE, 'Slots games') 
ON DUPLICATE KEY UPDATE enabled = TRUE;

INSERT INTO features (id, enabled, description) VALUES 
('battles', TRUE, 'Battles game') 
ON DUPLICATE KEY UPDATE enabled = TRUE;

INSERT INTO features (id, enabled, description) VALUES 
('cases', TRUE, 'Cases game') 
ON DUPLICATE KEY UPDATE enabled = TRUE;

-- Trading and wallet features
INSERT INTO features (id, enabled, description) VALUES 
('robuxDeposits', TRUE, 'Robux deposits') 
ON DUPLICATE KEY UPDATE enabled = TRUE;

INSERT INTO features (id, enabled, description) VALUES 
('robuxWithdrawals', TRUE, 'Robux withdrawals') 
ON DUPLICATE KEY UPDATE enabled = TRUE;

INSERT INTO features (id, enabled, description) VALUES 
('fiatDeposits', TRUE, 'Fiat currency deposits') 
ON DUPLICATE KEY UPDATE enabled = TRUE;

INSERT INTO features (id, enabled, description) VALUES 
('limitedDeposits', TRUE, 'Limited item deposits') 
ON DUPLICATE KEY UPDATE enabled = TRUE;

INSERT INTO features (id, enabled, description) VALUES 
('limitedWithdrawals', TRUE, 'Limited item withdrawals') 
ON DUPLICATE KEY UPDATE enabled = TRUE;

INSERT INTO features (id, enabled, description) VALUES 
('cardDeposits', TRUE, 'Credit card deposits') 
ON DUPLICATE KEY UPDATE enabled = TRUE;

INSERT INTO features (id, enabled, description) VALUES 
('cryptoDeposits', TRUE, 'Cryptocurrency deposits') 
ON DUPLICATE KEY UPDATE enabled = TRUE;

INSERT INTO features (id, enabled, description) VALUES 
('cryptoWithdrawals', TRUE, 'Cryptocurrency withdrawals') 
ON DUPLICATE KEY UPDATE enabled = TRUE;

-- Social and community features
INSERT INTO features (id, enabled, description) VALUES 
('chat', TRUE, 'Chat system') 
ON DUPLICATE KEY UPDATE enabled = TRUE;

INSERT INTO features (id, enabled, description) VALUES 
('rain', TRUE, 'Rain events') 
ON DUPLICATE KEY UPDATE enabled = TRUE;

INSERT INTO features (id, enabled, description) VALUES 
('tips', TRUE, 'User tipping') 
ON DUPLICATE KEY UPDATE enabled = TRUE;

INSERT INTO features (id, enabled, description) VALUES 
('surveys', TRUE, 'Survey system') 
ON DUPLICATE KEY UPDATE enabled = TRUE;

INSERT INTO features (id, enabled, description) VALUES 
('promoCodes', TRUE, 'Promo codes') 
ON DUPLICATE KEY UPDATE enabled = TRUE;

INSERT INTO features (id, enabled, description) VALUES 
('affiliates', TRUE, 'Affiliate system') 
ON DUPLICATE KEY UPDATE enabled = TRUE;

INSERT INTO features (id, enabled, description) VALUES 
('leaderboard', TRUE, 'Leaderboard system') 
ON DUPLICATE KEY UPDATE enabled = TRUE;

INSERT INTO features (id, enabled, description) VALUES 
('rakeback', TRUE, 'Rakeback rewards') 
ON DUPLICATE KEY UPDATE enabled = TRUE;

-- Show enabled features
SELECT * FROM features WHERE enabled = TRUE; 
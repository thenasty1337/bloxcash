-- Migration: Add SpinShield fields to bets table
-- This allows storing additional SpinShield game information for better live feed display

-- Add new columns to bets table
ALTER TABLE bets 
ADD COLUMN spinshield_round_id VARCHAR(255) NULL AFTER gameId,
ADD COLUMN spinshield_game_id VARCHAR(255) NULL AFTER spinshield_round_id,
ADD COLUMN provider VARCHAR(100) NULL AFTER spinshield_game_id;

-- Make gameId nullable for SpinShield bets (since we use spinshield_round_id instead)
ALTER TABLE bets MODIFY COLUMN gameId INT NULL;

-- Add index for better query performance
CREATE INDEX idx_bets_spinshield_round_id ON bets(spinshield_round_id);
CREATE INDEX idx_bets_spinshield_game_id ON bets(spinshield_game_id);
CREATE INDEX idx_bets_provider ON bets(provider);

-- Update existing slot bets to have provider = 'spinshield' if they don't have provider set
UPDATE bets SET provider = 'spinshield' WHERE game = 'slot' AND provider IS NULL; 
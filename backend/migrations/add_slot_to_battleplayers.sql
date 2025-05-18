-- Add slot column to battlePlayers table
ALTER TABLE `battlePlayers` 
ADD COLUMN `slot` INT NOT NULL DEFAULT 1 AFTER `userId`;

-- Add missing columns to battles table
ALTER TABLE `battles` 
ADD COLUMN `ownerId` CHAR(26) NOT NULL AFTER `id`,
ADD COLUMN `ownerFunding` INT NOT NULL DEFAULT 0 AFTER `ownerId`,
ADD COLUMN `entryPrice` DECIMAL(20,8) NOT NULL DEFAULT 0 AFTER `ownerFunding`,
ADD COLUMN `privKey` VARCHAR(255) DEFAULT NULL AFTER `entryPrice`,
ADD COLUMN `minLevel` INT NOT NULL DEFAULT 0 AFTER `privKey`,
ADD COLUMN `teams` INT NOT NULL DEFAULT 2 AFTER `minLevel`,
ADD COLUMN `playersPerTeam` INT NOT NULL DEFAULT 1 AFTER `teams`,
ADD COLUMN `gamemode` VARCHAR(50) NOT NULL DEFAULT 'standard' AFTER `playersPerTeam`,
ADD CONSTRAINT `fk_battles_ownerId` FOREIGN KEY (`ownerId`) REFERENCES `users` (`id`) ON DELETE CASCADE;

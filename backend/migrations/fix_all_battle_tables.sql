-- Comprehensive fix for all battle-related tables

-- Add missing columns to battles table
-- We need to check if each column exists before trying to add it

-- Check if ownerId column exists
SET @columnExists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'battles' 
  AND COLUMN_NAME = 'ownerId'
);

SET @sql = IF(@columnExists = 0, 'ALTER TABLE `battles` ADD COLUMN `ownerId` CHAR(26) NULL AFTER `id`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if ownerFunding column exists
SET @columnExists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'battles' 
  AND COLUMN_NAME = 'ownerFunding'
);

SET @sql = IF(@columnExists = 0, 'ALTER TABLE `battles` ADD COLUMN `ownerFunding` INT NOT NULL DEFAULT 0 AFTER `ownerId`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if entryPrice column exists
SET @columnExists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'battles' 
  AND COLUMN_NAME = 'entryPrice'
);

SET @sql = IF(@columnExists = 0, 'ALTER TABLE `battles` ADD COLUMN `entryPrice` DECIMAL(20,8) NOT NULL DEFAULT 0 AFTER `ownerFunding`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if privKey column exists
SET @columnExists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'battles' 
  AND COLUMN_NAME = 'privKey'
);

SET @sql = IF(@columnExists = 0, 'ALTER TABLE `battles` ADD COLUMN `privKey` VARCHAR(255) DEFAULT NULL AFTER `entryPrice`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if minLevel column exists
SET @columnExists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'battles' 
  AND COLUMN_NAME = 'minLevel'
);

SET @sql = IF(@columnExists = 0, 'ALTER TABLE `battles` ADD COLUMN `minLevel` INT NOT NULL DEFAULT 0 AFTER `privKey`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if teams column exists
SET @columnExists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'battles' 
  AND COLUMN_NAME = 'teams'
);

SET @sql = IF(@columnExists = 0, 'ALTER TABLE `battles` ADD COLUMN `teams` INT NOT NULL DEFAULT 2 AFTER `minLevel`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if playersPerTeam column exists
SET @columnExists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'battles' 
  AND COLUMN_NAME = 'playersPerTeam'
);

SET @sql = IF(@columnExists = 0, 'ALTER TABLE `battles` ADD COLUMN `playersPerTeam` INT NOT NULL DEFAULT 1 AFTER `teams`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if gamemode column exists
SET @columnExists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'battles' 
  AND COLUMN_NAME = 'gamemode'
);

SET @sql = IF(@columnExists = 0, 'ALTER TABLE `battles` ADD COLUMN `gamemode` VARCHAR(50) NOT NULL DEFAULT \'standard\' AFTER `playersPerTeam`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if EOSBlock column exists
SET @columnExists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'battles' 
  AND COLUMN_NAME = 'EOSBlock'
);

SET @sql = IF(@columnExists = 0, 'ALTER TABLE `battles` ADD COLUMN `EOSBlock` INT NULL AFTER `gamemode`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Fix the battlePlayers table - add slot column
SET @columnExists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'battlePlayers' 
  AND COLUMN_NAME = 'slot'
);

SET @sql = IF(@columnExists = 0, 'ALTER TABLE `battlePlayers` ADD COLUMN `slot` INT NOT NULL DEFAULT 1 AFTER `userId`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create battleRounds table if it doesn't exist
CREATE TABLE IF NOT EXISTS `battleRounds` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `battleId` bigint unsigned NOT NULL,
  `caseVersionId` bigint unsigned NOT NULL,
  `round` int NOT NULL,
  `startedAt` timestamp NULL DEFAULT NULL,
  `endedAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_battleRounds_battleId` (`battleId`),
  KEY `fk_battleRounds_caseVersionId` (`caseVersionId`),
  CONSTRAINT `fk_battleRounds_battleId` FOREIGN KEY (`battleId`) REFERENCES `battles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_battleRounds_caseVersionId` FOREIGN KEY (`caseVersionId`) REFERENCES `caseVersions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create battleOpenings table if it doesn't exist
CREATE TABLE IF NOT EXISTS `battleOpenings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `battleId` bigint unsigned NOT NULL,
  `caseOpeningId` bigint unsigned NOT NULL,
  `round` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_battleOpenings_battleId` (`battleId`),
  KEY `fk_battleOpenings_caseOpeningId` (`caseOpeningId`),
  CONSTRAINT `fk_battleOpenings_battleId` FOREIGN KEY (`battleId`) REFERENCES `battles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_battleOpenings_caseOpeningId` FOREIGN KEY (`caseOpeningId`) REFERENCES `caseOpenings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Make sure the necessary tables have foreign keys to the `users` table
SET @constraintExists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'battles' 
  AND CONSTRAINT_NAME = 'fk_battles_ownerId'
);

SET @sql = IF(@constraintExists = 0, 'ALTER TABLE `battles` ADD CONSTRAINT `fk_battles_ownerId` FOREIGN KEY (`ownerId`) REFERENCES `users` (`id`) ON DELETE CASCADE', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

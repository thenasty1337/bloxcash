-- Comprehensive fix for battles-related tables
-- Fix the battlePlayers table - add slot column
ALTER TABLE `battlePlayers` 
ADD COLUMN IF NOT EXISTS `slot` INT NOT NULL DEFAULT 1 AFTER `userId`;

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

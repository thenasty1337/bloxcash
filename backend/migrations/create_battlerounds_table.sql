-- Create the battleRounds table
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

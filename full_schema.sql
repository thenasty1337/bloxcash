-- MySQL dump 10.13  Distrib 9.1.0, for macos15.2 (arm64)
--
-- Host: localhost    Database: bloxcash_db
-- ------------------------------------------------------
-- Server version	9.1.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `adurite`
--

DROP TABLE IF EXISTS `adurite`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adurite` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `aduriteId` varchar(255) NOT NULL,
  `userId` CHAR(26) NOT NULL,
  `robuxAmount` decimal(20,8) NOT NULL,
  `fiatAmount` decimal(20,8) DEFAULT NULL,
  `status` varchar(50) NOT NULL,
  `reservationId` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_adurite_userId` (`userId`),
  CONSTRAINT `fk_adurite_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adurite`
--

LOCK TABLES `adurite` WRITE;
/*!40000 ALTER TABLE `adurite` DISABLE KEYS */;
/*!40000 ALTER TABLE `adurite` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `affiliateClaims`
--

DROP TABLE IF EXISTS `affiliateClaims`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `affiliateClaims` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` CHAR(26) NOT NULL,
  `amount` decimal(20,8) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `userId_createdAt_idx` (`userId`,`createdAt`),
  CONSTRAINT `fk_affiliateClaims_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `affiliateClaims`
--

LOCK TABLES `affiliateClaims` WRITE;
/*!40000 ALTER TABLE `affiliateClaims` DISABLE KEYS */;
/*!40000 ALTER TABLE `affiliateClaims` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `affiliates`
--

DROP TABLE IF EXISTS `affiliates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `affiliates` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` CHAR(26) NOT NULL,
  `affiliateId` CHAR(26) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `userId_unique` (`userId`),
  KEY `affiliateId_idx` (`affiliateId`),
  CONSTRAINT `fk_affiliates_affiliateId` FOREIGN KEY (`affiliateId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_affiliates_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `affiliates`
--

LOCK TABLES `affiliates` WRITE;
/*!40000 ALTER TABLE `affiliates` DISABLE KEYS */;
/*!40000 ALTER TABLE `affiliates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bannedPhrases`
--

DROP TABLE IF EXISTS `bannedPhrases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bannedPhrases` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `phrase` varchar(255) NOT NULL,
  `addedBy` CHAR(26) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phrase_unique` (`phrase`),
  KEY `fk_bannedPhrases_addedBy` (`addedBy`),
  CONSTRAINT `fk_bannedPhrases_addedBy` FOREIGN KEY (`addedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bannedPhrases`
--

LOCK TABLES `bannedPhrases` WRITE;
/*!40000 ALTER TABLE `bannedPhrases` DISABLE KEYS */;
INSERT INTO `bannedPhrases` VALUES (1,'nigga',2,'2025-05-13 02:11:21');
/*!40000 ALTER TABLE `bannedPhrases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `battleOpenings`
--

DROP TABLE IF EXISTS `battleOpenings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `battleOpenings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `battleId` bigint unsigned NOT NULL,
  `caseOpeningId` bigint unsigned NOT NULL,
  `round` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_battleOpenings_battleId` (`battleId`),
  KEY `fk_battleOpenings_caseOpeningId` (`caseOpeningId`),
  CONSTRAINT `fk_battleOpenings_battleId` FOREIGN KEY (`battleId`) REFERENCES `battles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_battleOpenings_caseOpeningId` FOREIGN KEY (`caseOpeningId`) REFERENCES `caseOpenings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `battleOpenings`
--

LOCK TABLES `battleOpenings` WRITE;
/*!40000 ALTER TABLE `battleOpenings` DISABLE KEYS */;
/*!40000 ALTER TABLE `battleOpenings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `battlePlayers`
--

DROP TABLE IF EXISTS `battlePlayers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `battlePlayers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `battleId` bigint unsigned NOT NULL,
  `userId` CHAR(26) NOT NULL,
  `team` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `battleId_userId_unique` (`battleId`,`userId`),
  KEY `fk_battlePlayers_userId` (`userId`),
  CONSTRAINT `fk_battlePlayers_battleId` FOREIGN KEY (`battleId`) REFERENCES `battles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_battlePlayers_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `battlePlayers`
--

LOCK TABLES `battlePlayers` WRITE;
/*!40000 ALTER TABLE `battlePlayers` DISABLE KEYS */;
/*!40000 ALTER TABLE `battlePlayers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `battles`
--

DROP TABLE IF EXISTS `battles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `battles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `round` int NOT NULL DEFAULT '0',
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  `serverSeed` varchar(255) NOT NULL,
  `clientSeed` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `startedAt` timestamp NULL DEFAULT NULL,
  `endedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `battles`
--

LOCK TABLES `battles` WRITE;
/*!40000 ALTER TABLE `battles` DISABLE KEYS */;
/*!40000 ALTER TABLE `battles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bets`
--

DROP TABLE IF EXISTS `bets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bets` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` CHAR(26) NOT NULL,
  `game` varchar(50) NOT NULL,
  `gameId` bigint unsigned NOT NULL,
  `amount` decimal(20,8) NOT NULL,
  `winnings` decimal(20,8) DEFAULT '0.00000000',
  `edge` decimal(20,8) DEFAULT '0.00000000',
  `payout` decimal(20,8) DEFAULT '0.00000000',
  `choice` varchar(255) DEFAULT NULL,
  `completed` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `userId_game_idx` (`userId`,`game`),
  CONSTRAINT `fk_bets_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `cardDeposits`
--

DROP TABLE IF EXISTS `cardDeposits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cardDeposits` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` CHAR(26) NOT NULL,
  `fiatAmount` decimal(20,2) NOT NULL,
  `robuxAmount` decimal(20,8) DEFAULT NULL,
  `providerTransactionId` varchar(255) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  `completed` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modifiedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `userId_idx` (`userId`),
  KEY `status_idx` (`status`),
  CONSTRAINT `fk_cardDeposits_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cardDeposits`
--

LOCK TABLES `cardDeposits` WRITE;
/*!40000 ALTER TABLE `cardDeposits` DISABLE KEYS */;
/*!40000 ALTER TABLE `cardDeposits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `caseItems`
--

DROP TABLE IF EXISTS `caseItems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `caseItems` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `caseVersionId` bigint unsigned NOT NULL,
  `robloxId` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `img` varchar(255) DEFAULT NULL,
  `price` decimal(20,8) NOT NULL,
  `rangeFrom` decimal(10,4) NOT NULL,
  `rangeTo` decimal(10,4) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_caseItems_caseVersionId` (`caseVersionId`),
  CONSTRAINT `fk_caseItems_caseVersionId` FOREIGN KEY (`caseVersionId`) REFERENCES `caseVersions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `caseItems`
--

LOCK TABLES `caseItems` WRITE;
/*!40000 ALTER TABLE `caseItems` DISABLE KEYS */;
/*!40000 ALTER TABLE `caseItems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `caseOpenings`
--

DROP TABLE IF EXISTS `caseOpenings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `caseOpenings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` CHAR(26) NOT NULL,
  `caseVersionId` bigint unsigned NOT NULL,
  `rollId` bigint unsigned NOT NULL,
  `caseItemId` bigint unsigned NOT NULL,
  `cost` decimal(20,8) NOT NULL,
  `winnings` decimal(20,8) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_caseOpenings_userId` (`userId`),
  KEY `fk_caseOpenings_caseVersionId` (`caseVersionId`),
  KEY `fk_caseOpenings_rollId` (`rollId`),
  KEY `fk_caseOpenings_caseItemId` (`caseItemId`),
  CONSTRAINT `fk_caseOpenings_caseItemId` FOREIGN KEY (`caseItemId`) REFERENCES `caseItems` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_caseOpenings_caseVersionId` FOREIGN KEY (`caseVersionId`) REFERENCES `caseVersions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_caseOpenings_rollId` FOREIGN KEY (`rollId`) REFERENCES `fairRolls` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_caseOpenings_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `caseOpenings`
--

LOCK TABLES `caseOpenings` WRITE;
/*!40000 ALTER TABLE `caseOpenings` DISABLE KEYS */;
/*!40000 ALTER TABLE `caseOpenings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cases`
--

DROP TABLE IF EXISTS `cases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cases` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `img` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cases`
--

LOCK TABLES `cases` WRITE;
/*!40000 ALTER TABLE `cases` DISABLE KEYS */;
/*!40000 ALTER TABLE `cases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `caseVersions`
--

DROP TABLE IF EXISTS `caseVersions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `caseVersions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `caseId` bigint unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` decimal(20,8) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `endedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_caseVersions_caseId` (`caseId`),
  CONSTRAINT `fk_caseVersions_caseId` FOREIGN KEY (`caseId`) REFERENCES `cases` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `caseVersions`
--

LOCK TABLES `caseVersions` WRITE;
/*!40000 ALTER TABLE `caseVersions` DISABLE KEYS */;
/*!40000 ALTER TABLE `caseVersions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chatMessages`
--

DROP TABLE IF EXISTS `chatMessages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chatMessages` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `senderId` CHAR(26) DEFAULT NULL,
  `channelId` varchar(50) DEFAULT NULL,
  `type` varchar(50) NOT NULL,
  `content` text NOT NULL,
  `replyTo` bigint unsigned DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deletedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_chatMessages_senderId` (`senderId`),
  KEY `fk_chatMessages_replyTo` (`replyTo`),
  KEY `channelId_deletedAt_idx` (`channelId`,`deletedAt`),
  CONSTRAINT `fk_chatMessages_replyTo` FOREIGN KEY (`replyTo`) REFERENCES `chatMessages` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_chatMessages_senderId` FOREIGN KEY (`senderId`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `clientSeeds`
--

DROP TABLE IF EXISTS `clientSeeds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientSeeds` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` CHAR(26) NOT NULL,
  `seed` varchar(255) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `endedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId_endedAt_idx` (`userId`,`endedAt`),
  CONSTRAINT `fk_clientSeeds_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;



--
-- Table structure for table `coinflips`
--

DROP TABLE IF EXISTS `coinflips`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coinflips` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ownerId` CHAR(26) NOT NULL,
  `fire` CHAR(26) DEFAULT NULL,
  `ice` CHAR(26) DEFAULT NULL,
  `amount` decimal(20,8) NOT NULL,
  `serverSeed` varchar(255) NOT NULL,
  `clientSeed` varchar(255) DEFAULT NULL,
  `EOSBlock` bigint DEFAULT NULL,
  `winnerSide` varchar(10) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `startedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_coinflips_fire` (`fire`),
  KEY `fk_coinflips_ice` (`ice`),
  KEY `fk_coinflips_ownerId` (`ownerId`),
  CONSTRAINT `fk_coinflips_fire` FOREIGN KEY (`fire`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_coinflips_ice` FOREIGN KEY (`ice`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_coinflips_ownerId` FOREIGN KEY (`ownerId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;



--
-- Table structure for table `crash`
--

DROP TABLE IF EXISTS `crash`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `crash` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `serverSeed` varchar(255) NOT NULL,
  `publicSeed` varchar(255) DEFAULT NULL,
  `crashPoint` decimal(10,2) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  `createdAt` timestamp NULL DEFAULT NULL,
  `startedAt` timestamp NULL DEFAULT NULL,
  `endedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `crash`
--

LOCK TABLES `crash` WRITE;
/*!40000 ALTER TABLE `crash` DISABLE KEYS */;
/*!40000 ALTER TABLE `crash` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `crashBets`
--

DROP TABLE IF EXISTS `crashBets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `crashBets` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` CHAR(26) NOT NULL,
  `roundId` bigint unsigned NOT NULL,
  `amount` decimal(20,8) NOT NULL,
  `autoCashoutPoint` decimal(10,2) DEFAULT NULL,
  `cashoutPoint` decimal(10,2) DEFAULT NULL,
  `winnings` decimal(20,8) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `roundId_userId_idx` (`roundId`,`userId`),
  KEY `fk_crashBets_userId` (`userId`),
  CONSTRAINT `fk_crashBets_roundId` FOREIGN KEY (`roundId`) REFERENCES `crash` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_crashBets_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `crashBets`
--

LOCK TABLES `crashBets` WRITE;
/*!40000 ALTER TABLE `crashBets` DISABLE KEYS */;
/*!40000 ALTER TABLE `crashBets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cryptoDeposits`
--

DROP TABLE IF EXISTS `cryptoDeposits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cryptoDeposits` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` CHAR(26) NOT NULL,
  `currency` varchar(10) NOT NULL,
  `cryptoAmount` decimal(36,18) NOT NULL,
  `fiatAmount` decimal(20,2) DEFAULT NULL,
  `robuxAmount` decimal(20,8) DEFAULT NULL,
  `txId` varchar(255) NOT NULL,
  `status` varchar(50) NOT NULL,
  `confirmations` int DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `txId_currency_unique` (`txId`,`currency`),
  KEY `fk_cryptoDeposits_userId` (`userId`),
  CONSTRAINT `fk_cryptoDeposits_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cryptoDeposits`
--

LOCK TABLES `cryptoDeposits` WRITE;
/*!40000 ALTER TABLE `cryptoDeposits` DISABLE KEYS */;
/*!40000 ALTER TABLE `cryptoDeposits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cryptos`
--

DROP TABLE IF EXISTS `cryptos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cryptos` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `coingeckoId` varchar(100) NOT NULL,
  `price` decimal(20,8) DEFAULT NULL,
  `confirmations` int unsigned DEFAULT NULL,
  `explorer` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `cryptoWallets`
--

DROP TABLE IF EXISTS `cryptoWallets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cryptoWallets` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` CHAR(26) NOT NULL,
  `currency` varchar(10) NOT NULL,
  `address` varchar(255) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `userId_currency_address_unique` (`userId`,`currency`,`address`),
  CONSTRAINT `fk_cryptoWallets_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cryptoWallets`
--

LOCK TABLES `cryptoWallets` WRITE;
/*!40000 ALTER TABLE `cryptoWallets` DISABLE KEYS */;
/*!40000 ALTER TABLE `cryptoWallets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cryptoWithdraws`
--

DROP TABLE IF EXISTS `cryptoWithdraws`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cryptoWithdraws` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` CHAR(26) NOT NULL,
  `currency` varchar(10) NOT NULL,
  `chain` varchar(50) DEFAULT NULL,
  `address` varchar(255) NOT NULL,
  `robuxAmount` decimal(20,8) NOT NULL,
  `fiatAmount` decimal(20,2) DEFAULT NULL,
  `cryptoAmount` decimal(36,18) DEFAULT NULL,
  `exchangeId` varchar(255) DEFAULT NULL,
  `txId` varchar(255) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modifiedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_cryptoWithdraws_userId` (`userId`),
  KEY `status_idx` (`status`),
  KEY `exchangeId_idx` (`exchangeId`),
  CONSTRAINT `fk_cryptoWithdraws_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cryptoWithdraws`
--

LOCK TABLES `cryptoWithdraws` WRITE;
/*!40000 ALTER TABLE `cryptoWithdraws` DISABLE KEYS */;
/*!40000 ALTER TABLE `cryptoWithdraws` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `discordAuths`
--

DROP TABLE IF EXISTS `discordAuths`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `discordAuths` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` CHAR(26) NOT NULL,
  `discordId` varchar(255) NOT NULL,
  `discordUsername` varchar(255) DEFAULT NULL,
  `discordAvatar` varchar(255) DEFAULT NULL,
  `token` text,
  `tokenExpiresAt` timestamp NULL DEFAULT NULL,
  `refreshToken` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `userId_unique` (`userId`),
  UNIQUE KEY `discordId_unique` (`discordId`),
  CONSTRAINT `fk_discordAuths_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `discordAuths`
--

LOCK TABLES `discordAuths` WRITE;
/*!40000 ALTER TABLE `discordAuths` DISABLE KEYS */;
/*!40000 ALTER TABLE `discordAuths` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `earnClaims`
--

DROP TABLE IF EXISTS `earnClaims`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `earnClaims` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `earnUserId` varchar(255) NOT NULL,
  `amount` decimal(20,8) NOT NULL,
  `claimedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_earnClaims_earnUserId` (`earnUserId`),
  CONSTRAINT `fk_earnClaims_earnUserId` FOREIGN KEY (`earnUserId`) REFERENCES `earnUsers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `earnClaims`
--

LOCK TABLES `earnClaims` WRITE;
/*!40000 ALTER TABLE `earnClaims` DISABLE KEYS */;
/*!40000 ALTER TABLE `earnClaims` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `earnUsers`
--

DROP TABLE IF EXISTS `earnUsers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `earnUsers` (
  `id` varchar(255) NOT NULL,
  `unclaimed` decimal(20,8) NOT NULL DEFAULT '0.00000000',
  `elegible` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `earnUsers`
--

LOCK TABLES `earnUsers` WRITE;
/*!40000 ALTER TABLE `earnUsers` DISABLE KEYS */;
/*!40000 ALTER TABLE `earnUsers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fairRolls`
--

DROP TABLE IF EXISTS `fairRolls`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fairRolls` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `serverSeed` varchar(255) NOT NULL,
  `clientSeed` varchar(255) NOT NULL,
  `nonce` bigint unsigned NOT NULL,
  `seed` varchar(255) DEFAULT NULL,
  `result` text NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fairRolls`
--

LOCK TABLES `fairRolls` WRITE;
/*!40000 ALTER TABLE `fairRolls` DISABLE KEYS */;
/*!40000 ALTER TABLE `fairRolls` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `features`
--

DROP TABLE IF EXISTS `features`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `features` (
  `id` varchar(100) NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '0',
  `description` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `features`
--

LOCK TABLES `features` WRITE;
/*!40000 ALTER TABLE `features` DISABLE KEYS */;
INSERT INTO `features` VALUES ('affiliates',1,'Affiliate system','2025-05-13 00:06:03','2025-05-13 00:06:03'),('battles',1,'Battles game','2025-05-13 00:06:03','2025-05-13 00:06:03'),('blackjack',1,'Blackjack game','2025-05-13 00:06:03','2025-05-13 00:06:03'),('cardDeposits',1,'Credit card deposits','2025-05-13 00:06:03','2025-05-13 00:06:03'),('cases',1,'Cases game','2025-05-13 00:06:03','2025-05-13 00:06:03'),('chat',1,'Chat system','2025-05-13 00:06:03','2025-05-13 00:06:03'),('coinflip',1,'Coinflip game','2025-05-13 00:06:03','2025-05-13 00:06:03'),('crash',1,'Crash game','2025-05-13 00:06:03','2025-05-13 00:06:03'),('cryptoDeposits',1,'Cryptocurrency deposits','2025-05-13 00:06:03','2025-05-13 00:06:03'),('cryptoWithdrawals',1,'Cryptocurrency withdrawals','2025-05-13 00:06:03','2025-05-13 00:06:03'),('fiatDeposits',1,'Fiat currency deposits','2025-05-13 00:06:03','2025-05-13 00:06:03'),('jackpot',1,'Jackpot game','2025-05-13 00:06:03','2025-05-13 00:06:03'),('leaderboard',1,'Leaderboard system','2025-05-13 00:06:03','2025-05-13 00:06:03'),('limitedDeposits',1,'Limited item deposits','2025-05-13 00:06:03','2025-05-13 00:06:03'),('limitedWithdrawals',1,'Limited item withdrawals','2025-05-13 00:06:03','2025-05-13 00:06:03'),('mines',1,'Mines game','2025-05-13 00:06:03','2025-05-13 00:06:03'),('promoCodes',1,'Promo codes','2025-05-13 00:06:03','2025-05-13 00:06:03'),('rain',1,'Rain events','2025-05-13 00:06:03','2025-05-13 00:06:03'),('rakeback',1,'Rakeback rewards','2025-05-13 00:06:03','2025-05-13 00:06:03'),('robuxDeposits',1,'Robux deposits','2025-05-13 00:06:03','2025-05-13 00:06:03'),('robuxWithdrawals',1,'Robux withdrawals','2025-05-13 00:06:03','2025-05-13 00:06:03'),('roulette',1,'Roulette game','2025-05-13 00:06:03','2025-05-13 00:06:03'),('slots',1,'Slots games','2025-05-13 00:06:03','2025-05-13 00:06:03'),('surveys',1,'Survey system','2025-05-13 00:06:03','2025-05-13 00:06:03'),('tips',1,'User tipping','2025-05-13 00:06:03','2025-05-13 00:06:03');
/*!40000 ALTER TABLE `features` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gamePassTxs`
--

DROP TABLE IF EXISTS `gamePassTxs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gamePassTxs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `assetId` varchar(255) DEFAULT NULL,
  `depositId` bigint unsigned DEFAULT NULL,
  `withdrawId` bigint unsigned DEFAULT NULL,
  `amount` decimal(20,2) NOT NULL,
  `universeId` varchar(255) DEFAULT NULL,
  `gamePassId` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_gpTxs_depositId` (`depositId`),
  KEY `fk_gpTxs_withdrawId` (`withdrawId`),
  CONSTRAINT `fk_gpTxs_depositId` FOREIGN KEY (`depositId`) REFERENCES `robuxExchanges` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_gpTxs_withdrawId` FOREIGN KEY (`withdrawId`) REFERENCES `robuxExchanges` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gamePassTxs`
--

LOCK TABLES `gamePassTxs` WRITE;
/*!40000 ALTER TABLE `gamePassTxs` DISABLE KEYS */;
/*!40000 ALTER TABLE `gamePassTxs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `giftCards`
--

DROP TABLE IF EXISTS `giftCards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `giftCards` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(255) NOT NULL,
  `amount` decimal(20,8) NOT NULL,
  `usd` tinyint(1) NOT NULL DEFAULT '0',
  `redeemedBy` CHAR(26) DEFAULT NULL,
  `redeemedAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code_unique` (`code`),
  KEY `redeemedBy_idx` (`redeemedBy`),
  CONSTRAINT `fk_giftCards_redeemedBy` FOREIGN KEY (`redeemedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `giftCards`
--

LOCK TABLES `giftCards` WRITE;
/*!40000 ALTER TABLE `giftCards` DISABLE KEYS */;
INSERT INTO `giftCards` VALUES (1,'musgvhfr43fi80h9',250.00000000,1,NULL,NULL,'2025-05-13 02:09:37','2025-05-13 02:09:37'),(2,'x08d0fxru6x76987',250.00000000,1,NULL,NULL,'2025-05-13 02:09:50','2025-05-13 02:09:50');
/*!40000 ALTER TABLE `giftCards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hacksawSessions`
--

DROP TABLE IF EXISTS `hacksawSessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hacksawSessions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` CHAR(26) NOT NULL,
  `sessionId` varchar(255) NOT NULL,
  `gameId` varchar(255) NOT NULL,
  `balance` decimal(20,8) NOT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'EUR',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sessionId_unique` (`sessionId`),
  KEY `fk_hacksawSessions_userId` (`userId`),
  CONSTRAINT `fk_hacksawSessions_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hacksawSessions`
--

LOCK TABLES `hacksawSessions` WRITE;
/*!40000 ALTER TABLE `hacksawSessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `hacksawSessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jackpot`
--

DROP TABLE IF EXISTS `jackpot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jackpot` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `serverSeed` varchar(255) NOT NULL,
  `clientSeed` varchar(255) DEFAULT NULL,
  `EOSBlock` bigint DEFAULT NULL,
  `amount` decimal(20,8) NOT NULL DEFAULT '0.00000000',
  `ticket` int unsigned DEFAULT NULL,
  `winnerBet` bigint unsigned DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `countStartedAt` timestamp NULL DEFAULT NULL,
  `rolledAt` timestamp NULL DEFAULT NULL,
  `endedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `winnerBet_idx` (`winnerBet`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `jackpotBets`
--

DROP TABLE IF EXISTS `jackpotBets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jackpotBets` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` CHAR(26) NOT NULL,
  `jackpotId` bigint unsigned NOT NULL,
  `amount` decimal(20,8) NOT NULL,
  `ticketsFrom` int unsigned NOT NULL,
  `ticketsTo` int unsigned NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `jackpotId_idx` (`jackpotId`),
  KEY `userId_idx` (`userId`),
  CONSTRAINT `fk_jackpotBets_jackpotId` FOREIGN KEY (`jackpotId`) REFERENCES `jackpot` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_jackpotBets_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `leaderboards`
--

DROP TABLE IF EXISTS `leaderboards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leaderboards` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(50) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `endedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `type_endedAt_idx` (`type`,`endedAt`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leaderboards`
--

LOCK TABLES `leaderboards` WRITE;
/*!40000 ALTER TABLE `leaderboards` DISABLE KEYS */;
INSERT INTO `leaderboards` VALUES (1,'daily','2025-05-11 22:00:00','2025-05-12 22:00:00'),(2,'weekly','2025-05-11 22:00:00',NULL),(3,'daily','2025-05-12 22:00:00',NULL);
/*!40000 ALTER TABLE `leaderboards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leaderboardUsers`
--

DROP TABLE IF EXISTS `leaderboardUsers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leaderboardUsers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `leaderboardId` bigint unsigned NOT NULL,
  `userId` CHAR(26) NOT NULL,
  `position` int unsigned NOT NULL,
  `totalWagered` decimal(20,8) NOT NULL,
  `amountWon` decimal(20,8) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `leaderboardId_userId_unique` (`leaderboardId`,`userId`),
  KEY `fk_leaderboardUsers_userId` (`userId`),
  CONSTRAINT `fk_leaderboardUsers_leaderboardId` FOREIGN KEY (`leaderboardId`) REFERENCES `leaderboards` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_leaderboardUsers_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leaderboardUsers`
--

LOCK TABLES `leaderboardUsers` WRITE;
/*!40000 ALTER TABLE `leaderboardUsers` DISABLE KEYS */;
/*!40000 ALTER TABLE `leaderboardUsers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `marketplaceListingItems`
--

DROP TABLE IF EXISTS `marketplaceListingItems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `marketplaceListingItems` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `marketplaceListingId` bigint unsigned NOT NULL,
  `userAssetId` varchar(255) NOT NULL,
  `assetId` varchar(255) NOT NULL,
  `price` decimal(20,8) NOT NULL,
  `discount` decimal(5,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `fk_mpli_listingId` (`marketplaceListingId`),
  CONSTRAINT `fk_mpli_listingId` FOREIGN KEY (`marketplaceListingId`) REFERENCES `marketplaceListings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marketplaceListingItems`
--

LOCK TABLES `marketplaceListingItems` WRITE;
/*!40000 ALTER TABLE `marketplaceListingItems` DISABLE KEYS */;
/*!40000 ALTER TABLE `marketplaceListingItems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `marketplaceListings`
--

DROP TABLE IF EXISTS `marketplaceListings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `marketplaceListings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `sellerId` CHAR(26) NOT NULL,
  `buyerId` CHAR(26) DEFAULT NULL,
  `robloxTradeId` varchar(255) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'active',
  `price` decimal(20,8) NOT NULL,
  `boughtPrice` decimal(20,8) DEFAULT NULL,
  `buyerItem` json DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_marketplaceListings_sellerId` (`sellerId`),
  KEY `fk_marketplaceListings_buyerId` (`buyerId`),
  CONSTRAINT `fk_marketplaceListings_buyerId` FOREIGN KEY (`buyerId`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_marketplaceListings_sellerId` FOREIGN KEY (`sellerId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marketplaceListings`
--

LOCK TABLES `marketplaceListings` WRITE;
/*!40000 ALTER TABLE `marketplaceListings` DISABLE KEYS */;
/*!40000 ALTER TABLE `marketplaceListings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mines`
--

DROP TABLE IF EXISTS `mines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mines` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` CHAR(26) NOT NULL,
  `amount` decimal(20,8) NOT NULL,
  `clientSeedId` bigint unsigned NOT NULL,
  `serverSeedId` bigint unsigned NOT NULL,
  `nonce` bigint unsigned NOT NULL,
  `minesCount` int unsigned NOT NULL,
  `mines` json NOT NULL DEFAULT (_utf8mb4'[]'),
  `revealedTiles` json NOT NULL DEFAULT (_utf8mb4'[]'),
  `payout` decimal(20,8) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `endedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId_endedAt_idx` (`userId`,`endedAt`),
  KEY `fk_mines_clientSeedId` (`clientSeedId`),
  KEY `fk_mines_serverSeedId` (`serverSeedId`),
  CONSTRAINT `fk_mines_clientSeedId` FOREIGN KEY (`clientSeedId`) REFERENCES `clientSeeds` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mines_serverSeedId` FOREIGN KEY (`serverSeedId`) REFERENCES `serverSeeds` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mines_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` CHAR(26) NOT NULL,
  `type` varchar(100) NOT NULL,
  `content` json DEFAULT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_notifications_userId` (`userId`),
  CONSTRAINT `fk_notifications_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `promoCodes`
--

DROP TABLE IF EXISTS `promoCodes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promoCodes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(255) NOT NULL,
  `amount` decimal(20,8) NOT NULL,
  `totalUses` int DEFAULT NULL,
  `currentUses` int NOT NULL DEFAULT '0',
  `minLvl` int DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expiresAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promoCodes`
--

LOCK TABLES `promoCodes` WRITE;
/*!40000 ALTER TABLE `promoCodes` DISABLE KEYS */;
/*!40000 ALTER TABLE `promoCodes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promoCodeUses`
--

DROP TABLE IF EXISTS `promoCodeUses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promoCodeUses` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` CHAR(26) NOT NULL,
  `promoCodeId` bigint unsigned NOT NULL,
  `usedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `userId_promoCodeId_unique` (`userId`,`promoCodeId`),
  KEY `fk_promoCodeUses_promoCodeId` (`promoCodeId`),
  CONSTRAINT `fk_promoCodeUses_promoCodeId` FOREIGN KEY (`promoCodeId`) REFERENCES `promoCodes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_promoCodeUses_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promoCodeUses`
--

LOCK TABLES `promoCodeUses` WRITE;
/*!40000 ALTER TABLE `promoCodeUses` DISABLE KEYS */;
/*!40000 ALTER TABLE `promoCodeUses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rains`
--

DROP TABLE IF EXISTS `rains`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rains` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `host` CHAR(26) DEFAULT NULL,
  `amount` decimal(20,8) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `endedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_rains_host` (`host`),
  CONSTRAINT `fk_rains_host` FOREIGN KEY (`host`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;



--
-- Table structure for table `rainTips`
--

DROP TABLE IF EXISTS `rainTips`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rainTips` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` CHAR(26) NOT NULL,
  `rainId` bigint unsigned NOT NULL,
  `amount` decimal(20,8) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `rainId_userId_idx` (`rainId`,`userId`),
  KEY `fk_rainTips_userId` (`userId`),
  CONSTRAINT `fk_rainTips_rainId` FOREIGN KEY (`rainId`) REFERENCES `rains` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rainTips_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rainTips`
--

LOCK TABLES `rainTips` WRITE;
/*!40000 ALTER TABLE `rainTips` DISABLE KEYS */;
/*!40000 ALTER TABLE `rainTips` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rainUsers`
--

DROP TABLE IF EXISTS `rainUsers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rainUsers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `rainId` bigint unsigned NOT NULL,
  `userId` CHAR(26) NOT NULL,
  `amount` decimal(20,8) DEFAULT NULL,
  `joinedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rainId_userId_unique` (`rainId`,`userId`),
  KEY `fk_rainUsers_userId` (`userId`),
  CONSTRAINT `fk_rainUsers_rainId` FOREIGN KEY (`rainId`) REFERENCES `rains` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rainUsers_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rainUsers`
--

LOCK TABLES `rainUsers` WRITE;
/*!40000 ALTER TABLE `rainUsers` DISABLE KEYS */;
/*!40000 ALTER TABLE `rainUsers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rakebackClaims`
--

DROP TABLE IF EXISTS `rakebackClaims`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rakebackClaims` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` CHAR(26) NOT NULL,
  `type` varchar(50) NOT NULL,
  `amount` decimal(20,8) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `userId_type_idx` (`userId`,`type`),
  CONSTRAINT `fk_rakebackClaims_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `robuxExchanges`
--

DROP TABLE IF EXISTS `robuxExchanges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `robuxExchanges` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` CHAR(26) NOT NULL,
  `operation` varchar(50) NOT NULL,
  `totalAmount` decimal(20,2) NOT NULL,
  `filledAmount` decimal(20,2) NOT NULL DEFAULT '0.00',
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_robuxExchanges_userId` (`userId`),
  CONSTRAINT `fk_robuxExchanges_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `robuxExchanges`
--

LOCK TABLES `robuxExchanges` WRITE;
/*!40000 ALTER TABLE `robuxExchanges` DISABLE KEYS */;
/*!40000 ALTER TABLE `robuxExchanges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roulette`
--

DROP TABLE IF EXISTS `roulette`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roulette` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `serverSeed` varchar(255) NOT NULL,
  `clientSeed` varchar(255) DEFAULT NULL,
  `publicSeed` varchar(255) DEFAULT NULL,
  `result` int DEFAULT NULL,
  `color` varchar(10) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'betting',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `rolledAt` timestamp NULL DEFAULT NULL,
  `endedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roulette`
--

LOCK TABLES `roulette` WRITE;
/*!40000 ALTER TABLE `roulette` DISABLE KEYS */;
/*!40000 ALTER TABLE `roulette` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `serverSeeds`
--

DROP TABLE IF EXISTS `serverSeeds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `serverSeeds` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` CHAR(26) NOT NULL,
  `seed` varchar(255) NOT NULL,
  `hashedSeed` varchar(255) DEFAULT NULL,
  `nonce` bigint unsigned NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `endedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId_endedAt_idx` (`userId`,`endedAt`),
  CONSTRAINT `fk_serverSeeds_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `slots`
--

DROP TABLE IF EXISTS `slots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `slots` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `provider` varchar(50) NOT NULL,
  `providerGameId` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `rtp` decimal(5,2) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `provider_gameId_unique` (`provider`,`providerGameId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `slots`
--

LOCK TABLES `slots` WRITE;
/*!40000 ALTER TABLE `slots` DISABLE KEYS */;
/*!40000 ALTER TABLE `slots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `surveys`
--

DROP TABLE IF EXISTS `surveys`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `surveys` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` CHAR(26) NOT NULL,
  `provider` varchar(50) NOT NULL,
  `transactionId` varchar(255) NOT NULL,
  `robux` decimal(20,8) NOT NULL,
  `revenue` decimal(20,8) DEFAULT NULL,
  `ip` varchar(45) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `hash` varchar(255) DEFAULT NULL,
  `chargedbackAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `provider_transactionId_unique` (`provider`,`transactionId`),
  KEY `fk_surveys_userId` (`userId`),
  CONSTRAINT `fk_surveys_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `surveys`
--

LOCK TABLES `surveys` WRITE;
/*!40000 ALTER TABLE `surveys` DISABLE KEYS */;
/*!40000 ALTER TABLE `surveys` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` CHAR(26) NOT NULL,
  `amount` decimal(20,8) NOT NULL,
  `type` varchar(50) NOT NULL,
  `method` varchar(50) NOT NULL,
  `methodId` bigint unsigned DEFAULT NULL,
  `methodDisplay` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `userId_idx` (`userId`),
  KEY `type_method_idx` (`type`,`method`),
  CONSTRAINT `fk_transactions_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` CHAR(26) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `balance` decimal(20,8) NOT NULL DEFAULT '0.00000000',
  `xp` bigint unsigned NOT NULL DEFAULT '0',
  `perms` int NOT NULL DEFAULT '0',
  `passwordHash` varchar(255) NOT NULL,
  `2fa` varchar(255) DEFAULT NULL,
  `robloxId` bigint unsigned DEFAULT NULL,
  `accountLock` tinyint(1) NOT NULL DEFAULT '0',
  `sponsorLock` tinyint(1) NOT NULL DEFAULT '0',
  `banned` tinyint(1) NOT NULL DEFAULT '0',
  `leaderboardBan` tinyint(1) NOT NULL DEFAULT '0',
  `verified` tinyint(1) NOT NULL DEFAULT '0',
  `role` varchar(50) DEFAULT NULL,
  `anon` tinyint(1) NOT NULL DEFAULT '0',
  `clientSeed` varchar(255) DEFAULT NULL,
  `serverSeed` varchar(255) DEFAULT NULL,
  `nonce` bigint unsigned NOT NULL DEFAULT '0',
  `ip` varchar(45) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `mutedUntil` timestamp NULL DEFAULT NULL COMMENT 'Timestamp when user''s chat mute expires',
  `tipBan` tinyint(1) NOT NULL DEFAULT '0',
  `rainBan` tinyint(1) NOT NULL DEFAULT '0',
  `maxPerTip` decimal(20,8) DEFAULT NULL,
  `maxTipPerUser` decimal(20,8) DEFAULT NULL,
  `tipAllowance` decimal(20,8) DEFAULT NULL,
  `rainTipAllowance` decimal(20,8) DEFAULT NULL,
  `cryptoAllowance` decimal(20,8) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lastLogout` timestamp NULL DEFAULT NULL,
  `affiliateCode` varchar(255) DEFAULT NULL,
  `affiliateCodeLock` tinyint(1) NOT NULL DEFAULT '0',
  `affiliateEarningsOffset` decimal(20,8) NOT NULL DEFAULT '0.00000000',
  `mentionsEnabled` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username_unique` (`username`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `robloxId` (`robloxId`),
  UNIQUE KEY `affiliateCode` (`affiliateCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Dumping routines for database 'bloxcash_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-13 15:31:21

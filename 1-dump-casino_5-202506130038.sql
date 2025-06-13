-- MySQL dump 10.13  Distrib 9.1.0, for macos15.2 (arm64)
--
-- Host: localhost    Database: casino_5
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
  `userId` char(26) NOT NULL,
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
  `userId` char(26) NOT NULL,
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
  `userId` char(26) NOT NULL,
  `affiliateId` char(26) NOT NULL,
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
  `addedBy` char(26) DEFAULT NULL,
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
INSERT INTO `bannedPhrases` VALUES (1,'nigga','2','2025-05-13 02:11:21');
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
) ENGINE=InnoDB AUTO_INCREMENT=1206 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;



--
-- Table structure for table `battlePlayers`
--

DROP TABLE IF EXISTS `battlePlayers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `battlePlayers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `battleId` bigint unsigned NOT NULL,
  `userId` char(26) NOT NULL,
  `slot` int NOT NULL DEFAULT '1',
  `team` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `battleId_userId_unique` (`battleId`,`userId`),
  KEY `fk_battlePlayers_userId` (`userId`),
  CONSTRAINT `fk_battlePlayers_battleId` FOREIGN KEY (`battleId`) REFERENCES `battles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_battlePlayers_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=150 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;



--
-- Table structure for table `battleRounds`
--

DROP TABLE IF EXISTS `battleRounds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `battleRounds` (
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
) ENGINE=InnoDB AUTO_INCREMENT=547 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `battles`
--

DROP TABLE IF EXISTS `battles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `battles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ownerId` char(26) NOT NULL,
  `ownerFunding` int NOT NULL DEFAULT '0',
  `entryPrice` decimal(20,8) NOT NULL DEFAULT '0.00000000',
  `privKey` varchar(255) DEFAULT NULL,
  `minLevel` int NOT NULL DEFAULT '0',
  `teams` int NOT NULL DEFAULT '2',
  `playersPerTeam` int NOT NULL DEFAULT '1',
  `gamemode` varchar(50) NOT NULL DEFAULT 'standard',
  `EOSBlock` int DEFAULT NULL,
  `round` int NOT NULL DEFAULT '0',
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  `winnerTeam` int DEFAULT NULL,
  `serverSeed` varchar(255) NOT NULL,
  `clientSeed` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `startedAt` timestamp NULL DEFAULT NULL,
  `endedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_battles_ownerId` (`ownerId`),
  CONSTRAINT `fk_battles_ownerId` FOREIGN KEY (`ownerId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `battles`
--

LOCK TABLES `battles` WRITE;
/*!40000 ALTER TABLE `battles` DISABLE KEYS */;
INSERT INTO `battles` VALUES (3,'01JV4YB5Z6MHAZMA1B4582K6RN',0,15816.49000000,NULL,0,2,1,'standard',436705769,1,'pending',2,'ea39d345d5fbc134f0a53bb88ef57810e5b35fd73dce365791ca389054cbc7aa','1a0799e9afef4b3da07c344be0f8126365f5645cc6abf87c4c5308195ae594de','2025-05-18 22:50:28','2025-05-18 23:41:15','2025-05-18 23:42:56'),(4,'01JV4YB5Z6MHAZMA1B4582K6RN',0,94898.94000000,NULL,0,2,1,'standard',436706145,6,'pending',1,'155a1ed939d9b03fcc06d9ee718f43c52e52bbe53ac8570dfed38380cb63f4c1','1a079b61873db254d3dc8d313b2f55711d47276369b2a925d1da187397bbddec','2025-05-18 23:40:01','2025-05-18 23:41:16','2025-05-18 23:42:56'),(5,'01JV4YB5Z6MHAZMA1B4582K6RN',0,94898.94000000,NULL,0,2,1,'standard',436706513,6,'pending',2,'abfa792acb66f29bf2e2121e9ea59598a929c9225a7994e938e80592114708fb','1a079cd1c668504b30126ff369a46ba913aeec4118d58051745d729fc6dccc40','2025-05-18 23:43:06','2025-05-18 23:43:09','2025-05-18 23:43:48'),(6,'01JV4YB5Z6MHAZMA1B4582K6RN',0,94898.94000000,NULL,0,2,1,'standard',436706629,6,'pending',2,'c0f123d57020155cbb81f4dcf14fe8d66af561ada6b2b3d0aa18e8b3fba273f4','1a079d4549aca2fa2dde28b6cbadd79025b46de8b3ae71d3667abf059ead187a','2025-05-18 23:44:00','2025-05-18 23:44:07','2025-05-18 23:44:46'),(7,'01JV4YB5Z6MHAZMA1B4582K6RN',0,94898.94000000,NULL,0,2,1,'standard',436706729,6,'pending',1,'d58313b7e94074f742ef2efe917b7ab1a8c11b48450cf94446190a22407e1383','1a079da9287d51d728cd6d7b58e412ea02f66b61820fb74bd43d4c89bdd46094','2025-05-18 23:44:54','2025-05-18 23:44:57','2025-05-18 23:45:36'),(8,'01JV4YB5Z6MHAZMA1B4582K6RN',0,158164.90000000,NULL,0,2,2,'standard',436707133,10,'pending',1,'0958a405d30f87a02ace551686e29075f068eac1098a6d7e64961eafb5a38d12','1a079f3d32e08290797e8b70038ed60be7172d8e0478604e92a5e1c9603d4855','2025-05-18 23:46:49','2025-05-18 23:48:19','2025-05-18 23:49:24'),(9,'01JV4YB5Z6MHAZMA1B4582K6RN',0,158164.90000000,NULL,0,4,1,'crazy',436707369,10,'pending',3,'437e8c1f00f95e2dfe07fcef896dcd9398ec88aa9be8a5089070a193812d59cc','1a07a02981225cf49de7da1f24bb014faa4a02ab2df3584c15c06a15ae0f360a','2025-05-18 23:50:10','2025-05-18 23:50:16','2025-05-18 23:51:21'),(10,'01JV4YB5Z6MHAZMA1B4582K6RN',0,158164.90000000,NULL,0,4,1,'crazy',436707520,10,'pending',1,'f24e64f34dc377220814015fb9605ce5a383cfe2c8e71864115b0d207b58a585','1a07a0c08fa1cd95c44a1bad1bce37ed2e539eabe801a3d672dcf5d804b4a0b4','2025-05-18 23:51:29','2025-05-18 23:51:32','2025-05-18 23:52:37'),(11,'01JV4YB5Z6MHAZMA1B4582K6RN',0,158164.90000000,NULL,0,4,1,'crazy',436707817,10,'pending',2,'0384ac08c6d8664e1ede1f47fb66b0b070c41dfc37871c2faccd6ca93090873a','1a07a1e972401623c010f8573625209c23d171990ff353f9617f20844b767836','2025-05-18 23:53:55','2025-05-18 23:54:01','2025-05-18 23:55:06'),(12,'01JV4YB5Z6MHAZMA1B4582K6RN',0,158164.90000000,NULL,0,4,1,'crazy',436707960,10,'pending',4,'2bd562e06e0a7f81f63ee1cd389ac8d5c5c00cc207bab7fdd4b681040992333d','1a07a278649bb575bea10a935fa30dff0c0090e45bf2b9f1dd23596e4fa1660e','2025-05-18 23:55:09','2025-05-18 23:55:12','2025-05-18 23:56:17'),(13,'01JV4YB5Z6MHAZMA1B4582K6RN',0,158164.90000000,NULL,0,4,1,'crazy',436708117,10,'pending',4,'e010a2aaaca4e0b984613fd6b93280d5dc1f95e780f62ef8f46dc99749d62267','1a07a315520a34c46284f71aca7b8e27b1c424533a03cf1a71cd32107399b6be','2025-05-18 23:56:26','2025-05-18 23:56:30','2025-05-18 23:57:35'),(14,'01JV4YB5Z6MHAZMA1B4582K6RN',0,15816.49000000,NULL,0,1,4,'group',436708321,1,'pending',1,'79bc276dd2376a47ac2f27c92badd481002a1cfdffd3d193ecb3b8d876071a3d','1a07a3e1473c40bd88f03c7877889bb8b0e691b9f5bc40845a7d96faba8a125a','2025-05-18 23:58:09','2025-05-18 23:58:13','2025-05-18 23:58:19'),(15,'01JV4YB5Z6MHAZMA1B4582K6RN',0,15816.49000000,NULL,0,1,4,'group',436708500,1,'pending',1,'028d761e3234f2e5b1bdd0b73626865907fca963de0db9729ef024a4db1fbf8e','1a07a494e7856d41c644745b49f329600eccf87a90feb90c5014d006add8ecb7','2025-05-18 23:59:38','2025-05-18 23:59:43','2025-05-18 23:59:49'),(16,'01JV4YB5Z6MHAZMA1B4582K6RN',0,15816.49000000,NULL,0,1,4,'group',436708696,1,'pending',1,'a3fb74ea3912db00965af5f7beec4ddae238e203c289bb855f218b8f96350bf0','1a07a558942e092a21251e547c863901f589b4739c2fdd3f26a1a7e175b59dfb','2025-05-19 00:01:13','2025-05-19 00:01:20','2025-05-19 00:01:27'),(17,'01JV4YB5Z6MHAZMA1B4582K6RN',0,15816.49000000,NULL,0,2,2,'standard',440311800,1,'pending',1,'316b5635519f5037c22e7c8d154aabbcb2c633b631680a6ac3ab6ab44b3cbea2','1a3e9ff821f4721179433597eeccd664a6da82f3a5b907772c9b61f9167f0e14','2025-06-08 20:42:04','2025-06-08 20:42:11','2025-06-08 20:42:17'),(18,'01JV4YB5Z6MHAZMA1B4582K6RN',0,15816.49000000,NULL,0,2,2,'standard',440311848,1,'pending',2,'09c172b30b38a456078e32e8f03b1d5eb7ce2a68decc999fe1ec7a2065f94474','1a3ea028c271197cd9426eefc0e2bc1dc3f311340c40c744218c59669425e14c','2025-06-08 20:42:28','2025-06-08 20:42:34','2025-06-08 20:42:41'),(19,'01JV4YB5Z6MHAZMA1B4582K6RN',0,15816.49000000,NULL,0,2,2,'standard',440311885,1,'pending',2,'2ef54de3cfa37ff3396156aabdc8462ecc712c21bafaf37422680a5e095050c5','1a3ea04df28dd1f7bba1faf9d31d6322e5b78d43a2753254f836632148fe19c3','2025-06-08 20:42:48','2025-06-08 20:42:52','2025-06-08 20:42:58'),(20,'01JV4YB5Z6MHAZMA1B4582K6RN',0,15816.49000000,NULL,0,2,2,'standard',440311912,1,'pending',1,'8d1d6eb9e85a044c73c407908c7d16a78a633f0f71f04e045b2ee465cccf5732','1a3ea0684bf4f680356396edb60eae84e2313412acaad315715d2af2cde4aacb','2025-06-08 20:43:01','2025-06-08 20:43:07','2025-06-08 20:43:13'),(21,'01JV4YB5Z6MHAZMA1B4582K6RN',0,15816.49000000,NULL,0,3,1,'standard',440846431,1,'pending',3,'5ce6915324a2b5de11c55456ae782be0757f9b4a62f9ed6a7d5d56dde8127d29','1a46c85fe66bb13adbc9faec2861eac4665fdd06ab944f9e38479676edc895ce','2025-06-11 22:50:09','2025-06-11 22:59:21','2025-06-11 22:59:28'),(22,'01JV4YB5Z6MHAZMA1B4582K6RN',0,79082.45000000,NULL,0,2,1,'standard',440846587,5,'pending',1,'1fd68c6c2366f5372bdd84df158f39ab4924e350c29c0e987ee4d7639b29e0ab','1a46c8fbc566ec057fe28c6bc087afb92adbcd0eb49fb76f29b2d551670a5b71','2025-06-11 23:00:22','2025-06-11 23:00:39','2025-06-11 23:01:11'),(23,'01JV4YB5Z6MHAZMA1B4582K6RN',0,158164.90000000,NULL,0,1,4,'group',440846812,10,'pending',1,'6854df2d812c20b94381e4658b46714ed158cec96236247c761ea7a57c70e830','1a46c9dcbe8a9f231a3533a34a424d9701f49157947c8d8949b7d64405dc9d7c','2025-06-11 23:02:25','2025-06-11 23:02:33','2025-06-11 23:03:38'),(24,'01JV4YB5Z6MHAZMA1B4582K6RN',0,158164.90000000,NULL,0,2,2,'crazy',440847161,10,'pending',2,'d6f2e1d7a0943d5d020bf32c0f66ea9e328d708b02a334ffa28d167858d84c16','1a46cb3979eda43e1777d891a83ad9c634188cac312654e2cd068cbcf23117b0','2025-06-11 23:05:22','2025-06-11 23:05:26','2025-06-11 23:06:31'),(25,'01JV4YB5Z6MHAZMA1B4582K6RN',0,15816.49000000,NULL,0,2,1,'standard',440848652,1,'pending',2,'d2418cd4a48793b294c61b5edf06b73e40b7e3b7feaf637dabadbec942b5c672','1a46d10caa3dbdf438ac155295aeab75a1b740d57bcacc6c01bd92b5eb1071ae','2025-06-11 23:17:49','2025-06-11 23:17:51','2025-06-11 23:17:57'),(26,'01JV4YB5Z6MHAZMA1B4582K6RN',0,15816.49000000,NULL,0,2,1,'standard',440848837,1,'pending',2,'7d67e3558347d2ff65a8b666e6eb1b40e1d510de72f6fbb770b9d02f2b18cb65','1a46d1c5075968931b1b22922450f90231c85fcd6e0bab85822423439803d5ff','2025-06-11 23:19:22','2025-06-11 23:19:24','2025-06-11 23:19:31'),(27,'01JV4YB5Z6MHAZMA1B4582K6RN',0,15816.49000000,NULL,0,1,4,'group',440848945,1,'pending',1,'39558ce0d5f3a7aa1342bc59d70904547298c36188ad620df43743d5c2ec2b32','1a46d2312199c934b016bc7db8724b07e29f18463e227c24b064d3b54290cfcf','2025-06-11 23:20:14','2025-06-11 23:20:18','2025-06-11 23:20:24'),(28,'01JV4YB5Z6MHAZMA1B4582K6RN',0,15816.49000000,NULL,0,2,1,'standard',NULL,0,'pending',NULL,'89c8b82d51d43c9589e37449e56e03e500d7613f0f75e51aded68c9d3573cf48',NULL,'2025-06-11 23:28:12',NULL,NULL),(29,'01JV4YB5Z6MHAZMA1B4582K6RN',0,142348.41000000,NULL,0,2,1,'standard',440859162,9,'pending',1,'a4a1683ff7f47ff66a8920c5bb0b51834d670dc12439bcb300aa5a45ab52a72a','1a46fa1a8e76fe1836700376d915a80043ab9e9ae747a24dc799c1a828cbbbab','2025-06-12 00:45:17','2025-06-12 00:45:27','2025-06-12 00:46:25'),(30,'01JV4YB5Z6MHAZMA1B4582K6RN',0,142348.41000000,NULL,0,2,1,'standard',440859475,9,'pending',1,'2bc6db423ce51e57844b21e0a4a20c4c656cae5022436120ddea226110ebd65d','1a46fb53aaf39a80d6ba63b259e943bf81257b54d021bb049f5b40b10afffeeb','2025-06-12 00:47:56','2025-06-12 00:48:04','2025-06-12 00:49:02'),(31,'01JV4YB5Z6MHAZMA1B4582K6RN',0,142348.41000000,NULL,0,2,1,'standard',440859712,9,'pending',2,'a0aea5595a09c3cba03a88d7a7d3eddc9feb3f25cf6e720aa3c3727e1483a9f3','1a46fc4001d45272a57cff79d226ce61997a1a38a539bc9bd788b7bd6f9f0ed7','2025-06-12 00:50:00','2025-06-12 00:50:02','2025-06-12 00:51:01'),(32,'01JV4YB5Z6MHAZMA1B4582K6RN',0,142348.41000000,NULL,0,2,1,'standard',440859872,9,'pending',2,'e97e5fc4ed3d08d0088d45706a85d4f985913f0f6aaece0685090580478d958f','1a46fce0ea5a50db87587cde2a551f9f4d9ce69f89f2399c9f29a81136a3b877','2025-06-12 00:51:14','2025-06-12 00:51:22','2025-06-12 00:52:20'),(33,'01JV4YB5Z6MHAZMA1B4582K6RN',0,142348.41000000,NULL,0,2,1,'standard',440860240,9,'pending',2,'138b0301b023bb86666ba9ad1544f20f9b5c7de65e72c8e96f792238f36af670','1a46fe50e4d9031c6038d41e3885c7b7739741aa5d7178af3c78f4374a4b057f','2025-06-12 00:54:22','2025-06-12 00:54:26','2025-06-12 00:55:24'),(34,'01JV4YB5Z6MHAZMA1B4582K6RN',0,142348.41000000,NULL,0,2,1,'standard',440860419,9,'pending',2,'21a742a5696026c073c6ad6b3c8ca3474bc7fc6bee5b19cffb3cba0713963510','1a46ff036cdadb4179e07cd11f5fbc7afd99f6b6a97b4ccb967d6c4ce6438f11','2025-06-12 00:55:51','2025-06-12 00:55:55','2025-06-12 00:56:54'),(35,'01JV4YB5Z6MHAZMA1B4582K6RN',0,142348.41000000,NULL,0,2,1,'standard',440860580,9,'pending',2,'a26fa3ea5ec8c8fc715bd82aae7eb9ba96c62e9336a0cf64ab1164597d9cc96a','1a46ffa422092ba734533914dc70992426c2bd0c57d3332f9a081148a37e7d58','2025-06-12 00:57:00','2025-06-12 00:57:16','2025-06-12 00:58:15'),(36,'01JV4YB5Z6MHAZMA1B4582K6RN',0,142348.41000000,NULL,0,2,1,'standard',440860712,9,'pending',1,'8763d756ee32044c754a3db389173d94bfabcc3cf79b6165893090b294367cef','1a470028457f693bb9c162986fec6094cbbeabaf0c9851cb00726ac8df782502','2025-06-12 00:58:19','2025-06-12 00:58:21','2025-06-12 00:59:20'),(37,'01JV4YB5Z6MHAZMA1B4582K6RN',0,142348.41000000,NULL,0,2,1,'standard',440860873,9,'pending',1,'c5efaa07a578338ab6f78b57e6a7d4a3c92c40cc69405a3d9875962ee65f9be0','1a4700c915a7d8ee8c15c992373630ffb02d214b6dd81c4f0930bb657b81b64f','2025-06-12 00:59:38','2025-06-12 00:59:42','2025-06-12 01:00:41'),(38,'01JV4YB5Z6MHAZMA1B4582K6RN',0,142348.41000000,NULL,0,2,1,'standard',440861009,9,'pending',1,'5a0635f07e205e603ca9e4fd4109939c19df6a20d461ecd8f929b55d96ebe8cc','1a470151e49631d0e67c5ba194aa97edc409fdea6bd9322e4ba4ac5dfefa997b','2025-06-12 01:00:47','2025-06-12 01:00:51','2025-06-12 01:01:49'),(39,'01JV4YB5Z6MHAZMA1B4582K6RN',0,142348.41000000,NULL,0,2,1,'standard',440861160,9,'pending',2,'1d13190a667b3d09c7ed0f4f662b134e4fdb02ff9eed456bf1d38ecf07b406a9','1a4701e8552cfe98cb03ce5ee773f74f1783a35a630842d9b37c25d0f8d2e1f4','2025-06-12 01:02:03','2025-06-12 01:02:06','2025-06-12 01:03:05'),(40,'01JV4YB5Z6MHAZMA1B4582K6RN',0,142348.41000000,NULL,0,2,1,'standard',440861518,9,'pending',2,'6301fb58bb57c54ad0ed507cc9791190e06c3c0a4ce6c56b826e71e32d541d3d','1a47034e683738b884580e83c4df5b6d54c6dac8194a18ffb3097daf59cbca70','2025-06-12 01:05:05','2025-06-12 01:05:06','2025-06-12 01:06:04'),(41,'01JV4YB5Z6MHAZMA1B4582K6RN',0,142348.41000000,NULL,0,2,1,'standard',440861754,9,'pending',2,'fd62ff5ddfae742b8f5c47cb736211eeed11718eca38e146cb507afa767f4c50','1a47043a9a968999fbaef9665d7ace7c5a26254b82dc299cf964ae709d20db92','2025-06-12 01:07:02','2025-06-12 01:07:04','2025-06-12 01:08:02'),(42,'01JV4YB5Z6MHAZMA1B4582K6RN',0,142348.41000000,NULL,0,2,1,'standard',440862062,9,'pending',1,'7861425d03c4a1d052017aa372ce83291ef1a440002dc0a0b32a2728ff1f7faa','1a47056e8208ca44bfd0dc7e9485bd53ae85c1e9994b03c23605dc9aec84e2c5','2025-06-12 01:09:35','2025-06-12 01:09:37','2025-06-12 01:10:36'),(43,'01JV4YB5Z6MHAZMA1B4582K6RN',0,142348.41000000,NULL,0,2,1,'standard',440862390,9,'pending',1,'c8acd30091691287dd567ac5c842dfda55a86dbe5685ea1eece0b8fa488045c8','1a4706b691d3220ba4e274cc5c5788d690b96a5fc38aa7fb6f80a6c8317d0544','2025-06-12 01:12:18','2025-06-12 01:12:21','2025-06-12 01:13:20'),(44,'01JV4YB5Z6MHAZMA1B4582K6RN',0,142348.41000000,NULL,0,2,1,'standard',440862623,9,'pending',2,'5c7ed8185bf9aadab896113ca166743d35f345dec7ddb2cc6e7174284ed2cd50','1a47079f97fdf3f73834ebf37c51438f8663195b01d4ebcde43fab0bc65aa565','2025-06-12 01:14:16','2025-06-12 01:14:18','2025-06-12 01:15:17'),(45,'01JV4YB5Z6MHAZMA1B4582K6RN',0,142348.41000000,NULL,0,2,1,'standard',440862872,9,'pending',1,'5f45bf0543d50d7fb7aeb08e7979d69698dbd355eb4b39f3e4ff88ee6dd08e7e','1a47089857a66acd7499fd3cc9c9273f82906fc7b0982d5228e8f34da1dbed7d','2025-06-12 01:16:19','2025-06-12 01:16:22','2025-06-12 01:17:21'),(46,'01JV4YB5Z6MHAZMA1B4582K6RN',0,142348.41000000,NULL,0,2,1,'standard',440863112,9,'pending',2,'362ec9234d03dcabeec197e48d75a2122fc207a82b3354ac66b89aa38c8fa6f5','1a470988401018b3dd38f5a8ae4fe0b6e43fed50dd6b91fbffef67aa9f4cf8ed','2025-06-12 01:18:21','2025-06-12 01:18:22','2025-06-12 01:19:21'),(47,'01JV4YB5Z6MHAZMA1B4582K6RN',0,142348.41000000,NULL,0,2,1,'standard',440863350,9,'pending',1,'b687fff6fa1343554d1a824a68ab9ae52d223bb353bd97aaeb426e2634dd1676','1a470a764ad4e4e54dd378478dfb213ed24d8c2eb0fea45a2a5399cb479f3df1','2025-06-12 01:20:19','2025-06-12 01:20:20','2025-06-12 01:21:19'),(48,'01JV4YB5Z6MHAZMA1B4582K6RN',0,142348.41000000,NULL,0,2,1,'standard',440863630,9,'pending',1,'7da09d7445db50c5863f5de93db952371b7f3634a93fbec36b4c3423022abff0','1a470b8e17b7f1fb446e91849eb566970f448a36dffd2a14f945c6b855534727','2025-06-12 01:22:39','2025-06-12 01:22:41','2025-06-12 01:23:40'),(49,'01JV4YB5Z6MHAZMA1B4582K6RN',0,142348.41000000,NULL,0,2,1,'standard',440864109,9,'pending',1,'27c4a57eb391f5cf6eb40c55a7f3e9944162ad52a3a01f4f0f9520277ed741e4','1a470d6d6850dfe7427705857b65779ffb5be7f53e97d7c5646c89f04f9f83f2','2025-06-12 01:26:35','2025-06-12 01:26:42','2025-06-12 01:27:40'),(50,'01JV4YB5Z6MHAZMA1B4582K6RN',0,142348.41000000,NULL,0,2,1,'standard',440864434,9,'pending',1,'40966ea269432b750d19a86695dd447d2afa328786012ec60fff4718f4df9339','1a470eb26a47d7e2e7d78193fc36b7bf45f4101c0398c90f09ee8bf8f32a267e','2025-06-12 01:29:21','2025-06-12 01:29:22','2025-06-12 01:30:21'),(51,'01JV4YB5Z6MHAZMA1B4582K6RN',0,142348.41000000,NULL,0,2,1,'standard',440864641,9,'pending',2,'0351152f6b81bcc9de0d660fa6eb94eda35105add15018cf1dfbf70498ee9a2a','1a470f817ea8d3ea83c43c81ad4fdd6988c7d6b91b675e786f8630a41fb7a85a','2025-06-12 01:31:05','2025-06-12 01:31:06','2025-06-12 01:32:05'),(52,'01JV4YB5Z6MHAZMA1B4582K6RN',0,142348.41000000,NULL,0,2,1,'standard',440864960,9,'pending',2,'58afec614144a7a8421e3d5e53de320e7bb5c36aaaac63a6cb2f1f0706015e3e','1a4710c09677fe4cc77827a199e5432e23abe5f1a60a669e89d832bbe46d39be','2025-06-12 01:33:43','2025-06-12 01:33:46','2025-06-12 01:34:44'),(53,'01JV4YB5Z6MHAZMA1B4582K6RN',0,142348.41000000,NULL,0,2,1,'standard',440865204,9,'pending',2,'0777c0464408c5ba2595087566f5dd5c5b84b6311405af9d103c6f576c527e43','1a4711b487cb16ea5585f583e7e30a5911d2c8a709ccc179f8d9be09d75c4a46','2025-06-12 01:35:46','2025-06-12 01:35:49','2025-06-12 01:36:48'),(54,'01JV4YB5Z6MHAZMA1B4582K6RN',0,142348.41000000,NULL,0,2,1,'standard',440865433,9,'pending',2,'2cc9242883ebe80361fc30588810fa610449879801d9aadd650b3170a758de9a','1a47129925f315c4d69dd530a528236683d92c097fd312157b992f9a32b96b93','2025-06-12 01:37:39','2025-06-12 01:37:42','2025-06-12 01:38:41'),(55,'01JV4YB5Z6MHAZMA1B4582K6RN',0,142348.41000000,NULL,0,2,1,'standard',440865681,9,'pending',1,'e30d796d794e2a359ae0b5e25614d06846e70275c67da5bf700725349aa2e344','1a471391463b60274b7c4f0b3dfbbbfe7e65a02dfbb42b0410881b40a00ed9eb','2025-06-12 01:39:44','2025-06-12 01:39:46','2025-06-12 01:40:45'),(56,'01JV4YB5Z6MHAZMA1B4582K6RN',0,474494.69000000,NULL,0,2,1,'standard',440865898,30,'pending',1,'4fcce5f65e27a33420459a2d88903055d2cbf10419481596fefe4dcd8214ec55','1a47146a2e554c241e52dbe3aebef22e8a70279bc305c6a7b3854a99e3546516','2025-06-12 01:41:32','2025-06-12 01:41:35','2025-06-12 01:44:50'),(57,'01JV4YB5Z6MHAZMA1B4582K6RN',0,474494.69000000,NULL,0,2,1,'standard',440866318,30,'pending',2,'0f87af8522eb2d9cf615e09dd91a1f9edd0d1b7e145f4683479124833c3c06da','1a47160e00440bc7d414d8775ba64c40f5e9bb2ce45b0ac21c89fb254453d9f9','2025-06-12 01:45:04','2025-06-12 01:45:05','2025-06-12 01:48:20'),(58,'01JV4YB5Z6MHAZMA1B4582K6RN',0,474494.69000000,NULL,0,2,1,'standard',440866724,30,'pending',1,'58ba9bff6cb29b19c2f76f739f79d249bc5cdb79dd7707c1f5057c58e25a6d9f','1a4717a414e8dc0ce59f47f67fdfb056a8dc3deda53ab2729b9a76facda1e158','2025-06-12 01:48:26','2025-06-12 01:48:28','2025-06-12 01:51:43'),(59,'01JV4YB5Z6MHAZMA1B4582K6RN',0,474494.69000000,NULL,0,2,1,'standard',440867128,30,'pending',1,'039ab7fc9ec5362f92dcd97bae551424b2701a65c4e875e019a5776f0da6b833','1a471938c188f585e4b25325867ccb4bd6ec42a5e15eda93f4dfc141772960d0','2025-06-12 01:51:49','2025-06-12 01:51:51','2025-06-12 01:55:06'),(60,'01JV4YB5Z6MHAZMA1B4582K6RN',0,474494.69000000,NULL,0,2,1,'standard',NULL,0,'pending',NULL,'1eab65ada01e587a7a67a62f69bbbd6e6b6353e87f5f0e37c6d18b5290bad20c',NULL,'2025-06-12 01:56:09',NULL,NULL),(61,'01JV4YB5Z6MHAZMA1B4582K6RN',0,474494.69000000,NULL,0,2,1,'standard',440867650,30,'pending',2,'19b918b1bf7a2373142b0ded2482cac8c27cb74525516d3697b4bcb440e7528c','1a471b42067487aa4f2642909d501dc7fe79e7e39e2db560b13a88df14db7535','2025-06-12 01:56:09','2025-06-12 01:56:11','2025-06-12 20:15:50');
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
  `userId` char(26) NOT NULL,
  `game` varchar(50) NOT NULL,
  `gameId` int DEFAULT NULL,
  `spinshield_round_id` varchar(255) DEFAULT NULL,
  `spinshield_game_id` varchar(255) DEFAULT NULL,
  `provider` varchar(100) DEFAULT NULL,
  `amount` decimal(20,8) NOT NULL,
  `winnings` decimal(20,8) DEFAULT '0.00000000',
  `edge` decimal(20,8) DEFAULT '0.00000000',
  `payout` decimal(20,8) DEFAULT '0.00000000',
  `choice` varchar(255) DEFAULT NULL,
  `completed` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `userId_game_idx` (`userId`,`game`),
  KEY `idx_bets_spinshield_round_id` (`spinshield_round_id`),
  KEY `idx_bets_spinshield_game_id` (`spinshield_game_id`),
  KEY `idx_bets_provider` (`provider`),
  CONSTRAINT `fk_bets_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=365 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `cardDeposits`
--

DROP TABLE IF EXISTS `cardDeposits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cardDeposits` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` char(26) NOT NULL,
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
  `img` varchar(512) DEFAULT NULL,
  `price` decimal(20,8) NOT NULL,
  `rangeFrom` decimal(10,4) NOT NULL,
  `rangeTo` decimal(10,4) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_caseItems_caseVersionId` (`caseVersionId`),
  CONSTRAINT `fk_caseItems_caseVersionId` FOREIGN KEY (`caseVersionId`) REFERENCES `caseVersions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `caseItems`
--

LOCK TABLES `caseItems` WRITE;
/*!40000 ALTER TABLE `caseItems` DISABLE KEYS */;
INSERT INTO `caseItems` VALUES (6,3,NULL,'AK-47 | Case Hardened','https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_ak47_aq_oiled_light_png.png',225143.70000000,1.0000,150.0000),(7,3,NULL,'★ Karambit | Case Hardened','https://imagedelivery.net/0ZvaEKTSlKUc2DwR965Mvw/a5d8e6f2-63df-4b82-adde-2669583cbd00/x300',176604.96000000,151.0000,1400.0000),(8,3,NULL,'Souvenir AWP | Dragon Lore','https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_awp_cu_medieval_dragon_awp_light_png.png',105509.85000000,1401.0000,4800.0000),(9,3,NULL,'★ M9 Bayonet | Case Hardened','https://imagedelivery.net/0ZvaEKTSlKUc2DwR965Mvw/52e473ce-7d6f-4358-1ef1-eb89685b5b00/x300',72638.62000000,4801.0000,9000.0000),(10,3,NULL,'EMS Katowice 2014 Legends','https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsQEl9Jg9SpIW1KgRr7PjJZW8SvYiJxNLFwKbyYb6IlztS6pV02e-U84rwiQPt_hVva2jzIY7AIVQ2ZVnV-AW2wfCv28H8FFIR5w',45919.77000000,9001.0000,14100.0000),(11,3,NULL,'Team Dignitas (Holo)','https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXQ9QVcJY8gulRYQV_bRvCiwMbQVg8kdFAYsrOiJQ500uD3eTJO45K3lYSKwa-gYO6JxjtTvMclie_Dp4nz2g3tqhE6ZD_7JdfGd1VvYFrX5BHglhWX5kVt/480x480',29204.13000000,14101.0000,19600.0000),(12,3,NULL,'★ Butterfly Knife | Gamma Doppler','https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_knife_butterfly_am_emerald_marbleized_light_png.png',13057.40000000,19601.0000,26500.0000),(13,3,NULL,'★ Flip Knife | Doppler','https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_knife_flip_am_ruby_marbleized_light_png.png',4613.02000000,26501.0000,35000.0000),(14,3,NULL,'MP9 | Sand Scale','https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_mp9_aa_hide-mp9_light_png.png',0.01000000,35001.0000,65000.0000),(15,3,NULL,'PP-Bizon | Rust Coat','https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/weapon_bizon_aq_steel_bravo_light_png.png',0.01000000,65001.0000,100000.0000);
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
  `userId` char(26) NOT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=1242 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cases`
--

LOCK TABLES `cases` WRITE;
/*!40000 ALTER TABLE `cases` DISABLE KEYS */;
INSERT INTO `cases` VALUES (1,'test','test','https://imagedelivery.net/0ZvaEKTSlKUc2DwR965Mvw/3e73cb71-566c-4f58-c955-5ffddf5f4200/x340','2025-05-15 13:13:33');
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `caseVersions`
--

LOCK TABLES `caseVersions` WRITE;
/*!40000 ALTER TABLE `caseVersions` DISABLE KEYS */;
INSERT INTO `caseVersions` VALUES (3,1,'test',15816.49000000,'2025-05-15 14:36:42',NULL);
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
  `senderId` char(26) DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=212 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `clientSeeds`
--

DROP TABLE IF EXISTS `clientSeeds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientSeeds` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` char(26) NOT NULL,
  `seed` varchar(255) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `endedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId_endedAt_idx` (`userId`,`endedAt`),
  CONSTRAINT `fk_clientSeeds_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientSeeds`
--

LOCK TABLES `clientSeeds` WRITE;
/*!40000 ALTER TABLE `clientSeeds` DISABLE KEYS */;
INSERT INTO `clientSeeds` VALUES (2,'01JV4YB5Z6MHAZMA1B4582K6RN','vgwz5LMorC','2025-05-13 13:46:29',NULL),(3,'01JX5TNEM0RA789TS51N1NFCMJ','mTCpATEoeR','2025-06-07 18:32:49',NULL);
/*!40000 ALTER TABLE `clientSeeds` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coinflips`
--

DROP TABLE IF EXISTS `coinflips`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coinflips` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ownerId` char(26) NOT NULL,
  `fire` char(26) DEFAULT NULL,
  `ice` char(26) DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coinflips`
--

LOCK TABLES `coinflips` WRITE;
/*!40000 ALTER TABLE `coinflips` DISABLE KEYS */;
INSERT INTO `coinflips` VALUES (3,'01JV4YB5Z6MHAZMA1B4582K6RN','01JV4YB5Z6MHAZMA1B4582K6RN','01JVJVWQPC3403M4GXQCAHSWFG',1211.00000000,'8bebef3e205acfd6049ecac48ee1c48e794ba339edeff6bf833fb0a83b29394b','1a3ea5d90df8ca8caaded0fb280395742149e387740bf941a464d16fd4e07900',440313305,'ice','pending','2025-05-13 19:16:23','2025-06-08 20:54:43'),(4,'01JV4YB5Z6MHAZMA1B4582K6RN','01JV4YB5Z6MHAZMA1B4582K6RN','01JVJVWQPC3403M4GXQCAHSWFG',150.00000000,'95bb585f8d5ab59b4ae922dd216fbe9a9848ec6978516ae2c689112648d3506b','1a3ea489cedffd59ecf54e4f8cfab337a4f5946291132491daacf76602c113bb',440312969,'fire','pending','2025-06-08 20:51:50','2025-06-08 20:51:55'),(5,'01JV4YB5Z6MHAZMA1B4582K6RN','01JV4YB5Z6MHAZMA1B4582K6RN','01JVJVWQPC3403M4GXQCAHSWFG',377.00000000,'6bfcb93d620ba77af10bb848f4b1d8391356d1fcec9741766e54f94945584cbe','1a3ea4bc72ac89f8a086d738ce7ca1b9a70a4c5fb6d0c6e8f7fbd14a6c3964c7',440313020,'ice','pending','2025-06-08 20:52:14','2025-06-08 20:52:20'),(6,'01JV4YB5Z6MHAZMA1B4582K6RN','01JVJVWQPC3403M4GXQCAHSWFG','01JV4YB5Z6MHAZMA1B4582K6RN',610.00000000,'de5e9c77d617f3169acb8451316a1fff52c167adfdd58d8d52deb24863790c7a','1a3ea4e8027c363219173d1faaa9fedc18bcd18899e09366f09d50c86b710d3a',440313064,'fire','pending','2025-06-08 20:52:41','2025-06-08 20:52:42'),(7,'01JV4YB5Z6MHAZMA1B4582K6RN','01JVJVWQPC3403M4GXQCAHSWFG','01JV4YB5Z6MHAZMA1B4582K6RN',108.00000000,'cb9465cfe78bab63dc276f425971d2158c20d51f0e102e948a6fff1509019773','1a3ea538863d9b6e21699941d789d59496005fa7d4d0e629eeccfb0165f24f83',440313144,'ice','pending','2025-06-08 20:53:19','2025-06-08 20:53:22');
/*!40000 ALTER TABLE `coinflips` ENABLE KEYS */;
UNLOCK TABLES;

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
  `userId` char(26) NOT NULL,
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
  `userId` char(26) NOT NULL,
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
-- Dumping data for table `cryptos`
--

LOCK TABLES `cryptos` WRITE;
/*!40000 ALTER TABLE `cryptos` DISABLE KEYS */;
INSERT INTO `cryptos` VALUES ('BNB.BSC','BNB (BSC)','binancecoin',655.10000000,NULL,NULL,'2025-05-13 13:41:11','2025-06-12 22:33:27'),('BTC','Bitcoin','bitcoin',105966.00000000,NULL,NULL,'2025-05-13 13:41:11','2025-06-12 22:33:27'),('BUSD.BEP20','BUSD (BEP20)','binance-usd',0.99351900,NULL,NULL,'2025-05-13 13:41:11','2025-06-02 18:54:23'),('DOGE','Dogecoin','dogecoin',0.18119200,NULL,NULL,'2025-05-13 13:41:11','2025-06-12 22:33:27'),('ETH','Ethereum','ethereum',2643.20000000,NULL,NULL,'2025-05-13 13:41:11','2025-06-12 22:33:27'),('LTC','Litecoin','litecoin',86.47000000,NULL,NULL,'2025-05-13 13:41:11','2025-06-12 22:33:27'),('TRX','TRON','tron',0.27173200,NULL,NULL,'2025-06-02 19:04:50','2025-06-12 22:33:27'),('USDC','USDC (ERC20)','usd-coin',0.99980400,NULL,NULL,'2025-05-13 13:41:11','2025-06-12 22:33:27'),('USDT.ERC20','USDT (ERC20)','tether',1.00000000,NULL,NULL,'2025-05-13 13:41:11','2025-06-07 12:33:04'),('XRP','Ripple','ripple',2.19000000,NULL,NULL,'2025-06-02 19:04:13','2025-06-12 22:23:23');
/*!40000 ALTER TABLE `cryptos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cryptoWallets`
--

DROP TABLE IF EXISTS `cryptoWallets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cryptoWallets` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` char(26) NOT NULL,
  `currency` varchar(10) NOT NULL,
  `address` varchar(255) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `userId_currency_address_unique` (`userId`,`currency`,`address`),
  CONSTRAINT `fk_cryptoWallets_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cryptoWallets`
--

LOCK TABLES `cryptoWallets` WRITE;
/*!40000 ALTER TABLE `cryptoWallets` DISABLE KEYS */;
INSERT INTO `cryptoWallets` VALUES (1,'01JV4YB5Z6MHAZMA1B4582K6RN','BTC','3P44DUDj5scr8YJk7vDgcXN8XgZm4Q1pxp','2025-05-13 13:48:52'),(2,'01JV4YB5Z6MHAZMA1B4582K6RN','USDT.ERC20','0xfc3400d3e767dbb684635c5e61f1ea1d4973e5de','2025-05-13 13:48:57'),(3,'01JV4YB5Z6MHAZMA1B4582K6RN','ETH','0x4018b5ea9623423d8f0733a1fd320dcd100e82ce','2025-05-13 13:49:10'),(4,'01JV4YB5Z6MHAZMA1B4582K6RN','BNB.BSC','0x9faefd5ee130f30af08c7e99cc92fb0aa4db9c82','2025-05-13 14:48:05'),(5,'01JV4YB5Z6MHAZMA1B4582K6RN','DOGE','DGPFFkoZR3GuPuj9WGUwoYQ8Q5roErQid8','2025-05-13 14:48:41'),(6,'01JV4YB5Z6MHAZMA1B4582K6RN','LTC','MWMU1TEBJ1EURfbK6GQ7rYzmTf7zFkhnSD','2025-05-13 14:48:43'),(7,'01JV4YB5Z6MHAZMA1B4582K6RN','USDC','0x1f5eacab0394b7c3c22e73b8acd7f9359f25d703','2025-05-13 14:48:47'),(8,'01JV4YB5Z6MHAZMA1B4582K6RN','XRP','rCoinaUERUrXb1aA7dJu8qRcmvPNiKS3d','2025-06-02 19:09:45'),(9,'01JV4YB5Z6MHAZMA1B4582K6RN','TRX','TFyte9Tyh3s2FK19rZtMZH3MywWmx4Tqux','2025-06-02 19:09:48');
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
  `userId` char(26) NOT NULL,
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
  `userId` char(26) NOT NULL,
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
-- Table structure for table `email_verification_tokens`
--

DROP TABLE IF EXISTS `email_verification_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_verification_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` char(26) NOT NULL,
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_verification_tokens`
--

LOCK TABLES `email_verification_tokens` WRITE;
/*!40000 ALTER TABLE `email_verification_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `email_verification_tokens` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=1259 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;



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
INSERT INTO `features` VALUES ('affiliates',1,'Affiliate system','2025-05-13 00:06:03','2025-05-13 00:06:03'),('battles',1,'Battles game','2025-05-13 00:06:03','2025-05-13 00:06:03'),('blackjack',1,'Blackjack game','2025-05-13 00:06:03','2025-05-13 00:06:03'),('cardDeposits',1,'Credit card deposits','2025-05-13 00:06:03','2025-05-13 00:06:03'),('cases',1,'Cases game','2025-05-13 00:06:03','2025-05-13 00:06:03'),('chat',1,'Chat system','2025-05-13 00:06:03','2025-05-13 00:06:03'),('coinflip',1,'Coinflip game','2025-05-13 00:06:03','2025-05-13 00:06:03'),('crash',1,'Crash game','2025-05-13 00:06:03','2025-05-13 00:06:03'),('cryptoDeposits',1,'Cryptocurrency deposits','2025-05-13 00:06:03','2025-05-13 00:06:03'),('cryptoWithdrawals',1,'Cryptocurrency withdrawals','2025-05-13 00:06:03','2025-05-13 00:06:03'),('fiatDeposits',1,'Fiat currency deposits','2025-05-13 00:06:03','2025-05-13 00:06:03'),('jackpot',1,'Jackpot game','2025-05-13 00:06:03','2025-05-13 00:06:03'),('leaderboard',1,'Leaderboard system','2025-05-13 00:06:03','2025-05-13 00:06:03'),('limitedDeposits',1,'Limited item deposits','2025-05-13 00:06:03','2025-05-13 00:06:03'),('limitedWithdrawals',1,'Limited item withdrawals','2025-05-13 00:06:03','2025-05-13 00:06:03'),('mines',1,'Mines game','2025-05-13 00:06:03','2025-05-13 00:06:03'),('promoCodes',1,'Promo codes','2025-05-13 00:06:03','2025-05-13 00:06:03'),('rain',0,'Rain events','2025-05-13 00:06:03','2025-06-08 19:26:34'),('rakeback',1,'Rakeback rewards','2025-05-13 00:06:03','2025-05-13 00:06:03'),('robuxDeposits',1,'Robux deposits','2025-05-13 00:06:03','2025-05-13 00:06:03'),('robuxWithdrawals',1,'Robux withdrawals','2025-05-13 00:06:03','2025-05-13 00:06:03'),('roulette',1,'Roulette game','2025-05-13 00:06:03','2025-05-13 00:06:03'),('slots',1,'Slots games','2025-05-13 00:06:03','2025-05-13 00:06:03'),('surveys',1,'Survey system','2025-05-13 00:06:03','2025-05-13 00:06:03'),('tips',1,'User tipping','2025-05-13 00:06:03','2025-05-13 00:06:03');
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
  `redeemedBy` char(26) DEFAULT NULL,
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
  `userId` char(26) NOT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jackpot`
--

LOCK TABLES `jackpot` WRITE;
/*!40000 ALTER TABLE `jackpot` DISABLE KEYS */;
INSERT INTO `jackpot` VALUES (3,'2d10c5c129f9bb3e1236f2771f73ff5ecfab38d79171747a8b6e1019327a6f9b','1a0798a50219d320483a1b94ede7c632ed39251e81fba2cc216d97fa9d27402b',436705445,24850.00000000,1155656,3,'pending','2025-05-13 13:41:10',NULL,'2025-05-18 23:34:15','2025-05-18 23:34:20'),(4,'750ca115c5425002c77457bfb42c33ebc346fde270d898fd9e4541fbf176717a','1a0799c9702d09c18f4821638e113438214562d7ce1e6836e1cc0fcd4a0df089',436705737,18684.00000000,233371,5,'pending','2025-05-18 23:34:25',NULL,'2025-05-18 23:36:41','2025-05-18 23:36:46'),(5,'9a7024e4599d94774d6b20f9c04cd8787e1d9e70f752367d3b0e486a584e7772','1a07ae083ec322baac4e2afb9ecd0a05d7a7a2a508da5e73a26f539aaa7e3737',436710920,19339.00000000,997686,10,'pending','2025-05-18 23:36:51',NULL,'2025-05-19 00:19:53','2025-05-19 00:19:58'),(6,'773f08bd4724f29164615b87ab89e2535a6ac63f1edf5f7f44caa174ecd4bcf5',NULL,NULL,0.00000000,NULL,NULL,'pending','2025-05-19 00:20:03',NULL,NULL,NULL);
/*!40000 ALTER TABLE `jackpot` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jackpotBets`
--

DROP TABLE IF EXISTS `jackpotBets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jackpotBets` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` char(26) NOT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jackpotBets`
--

LOCK TABLES `jackpotBets` WRITE;
/*!40000 ALTER TABLE `jackpotBets` DISABLE KEYS */;
INSERT INTO `jackpotBets` VALUES (3,'01JV4YB5Z6MHAZMA1B4582K6RN',3,12425.00000000,0,1242499,'2025-05-16 21:04:32'),(4,'01JVJVWQPC3403M4GXQCAHSWFG',3,12425.00000000,1242500,2484999,'2025-05-18 23:33:42'),(5,'01JV4YB5Z6MHAZMA1B4582K6RN',4,9342.00000000,0,934199,'2025-05-18 23:35:10'),(6,'01JVJVWQPC3403M4GXQCAHSWFG',4,9342.00000000,934200,1868399,'2025-05-18 23:36:10'),(7,'01JV4YB5Z6MHAZMA1B4582K6RN',5,3484.00000000,0,348399,'2025-05-19 00:18:20'),(8,'01JV4YB5Z6MHAZMA1B4582K6RN',5,1.00000000,348400,348499,'2025-05-19 00:18:25'),(9,'01JVJVWQPC3403M4GXQCAHSWFG',5,3485.00000000,348500,696999,'2025-05-19 00:19:20'),(10,'01JV4YB5Z6MHAZMA1B4582K6RN',5,12369.00000000,697000,1933899,'2025-05-19 00:19:45');
/*!40000 ALTER TABLE `jackpotBets` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leaderboards`
--

LOCK TABLES `leaderboards` WRITE;
/*!40000 ALTER TABLE `leaderboards` DISABLE KEYS */;
INSERT INTO `leaderboards` VALUES (1,'daily','2025-05-11 22:00:00','2025-05-12 22:00:00'),(2,'weekly','2025-05-11 22:00:00','2025-05-18 22:00:00'),(3,'daily','2025-05-12 22:00:00','2025-05-14 22:00:00'),(4,'daily','2025-05-14 22:00:00','2025-05-15 22:00:00'),(5,'daily','2025-05-15 22:00:00','2025-05-16 22:00:00'),(6,'daily','2025-05-16 22:00:00','2025-05-17 22:00:00'),(7,'daily','2025-05-17 22:00:00','2025-05-18 22:00:00'),(8,'daily','2025-05-18 22:00:00','2025-05-30 22:00:00'),(9,'weekly','2025-05-18 22:00:00','2025-05-30 22:00:00'),(10,'weekly','2025-05-30 22:00:00','2025-06-06 22:00:00'),(11,'daily','2025-05-30 22:00:00','2025-05-31 22:00:00'),(12,'daily','2025-05-31 22:00:00','2025-06-01 22:00:00'),(13,'daily','2025-06-01 22:00:00','2025-06-02 22:00:00'),(14,'daily','2025-06-02 22:00:00','2025-06-05 22:00:00'),(15,'daily','2025-06-05 22:00:00','2025-06-06 22:00:00'),(16,'weekly','2025-06-06 22:00:00',NULL),(17,'daily','2025-06-06 22:00:00','2025-06-07 22:00:00'),(18,'daily','2025-06-07 22:00:00','2025-06-08 22:00:00'),(19,'daily','2025-06-08 22:00:00','2025-06-10 22:00:00'),(20,'daily','2025-06-10 22:00:00','2025-06-11 22:00:00'),(21,'daily','2025-06-11 22:00:00','2025-06-12 22:00:00'),(22,'daily','2025-06-12 22:00:00',NULL);
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
  `userId` char(26) NOT NULL,
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
  `sellerId` char(26) NOT NULL,
  `buyerId` char(26) DEFAULT NULL,
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
  `userId` char(26) NOT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mines`
--

LOCK TABLES `mines` WRITE;
/*!40000 ALTER TABLE `mines` DISABLE KEYS */;
INSERT INTO `mines` VALUES (6,'01JV4YB5Z6MHAZMA1B4582K6RN',100.00000000,2,2,1,3,'[23, 11, 10]','[11]',0.00000000,'2025-05-16 12:46:16','2025-05-19 00:06:57'),(7,'01JV4YB5Z6MHAZMA1B4582K6RN',100.00000000,2,2,38,3,'[24, 3, 8]','[10, 9, 16, 5, 7, 0, 18]',261.00000000,'2025-05-19 00:07:02','2025-05-19 00:15:19'),(8,'01JV4YB5Z6MHAZMA1B4582K6RN',100.00000000,2,2,39,3,'[9, 20, 22]','[15, 11]',120.00000000,'2025-05-19 00:17:21','2025-05-19 00:17:24'),(9,'01JV4YB5Z6MHAZMA1B4582K6RN',100.00000000,2,2,40,3,'[6, 1, 18]','[15]',105.00000000,'2025-05-19 00:17:29','2025-05-19 00:17:37'),(10,'01JV4YB5Z6MHAZMA1B4582K6RN',100.00000000,2,2,41,9,'[15, 12, 23, 21, 17, 6, 10, 0, 13]','[6]',0.00000000,'2025-05-19 00:17:39','2025-05-19 00:17:41'),(11,'01JV4YB5Z6MHAZMA1B4582K6RN',100.00000000,2,2,42,9,'[2, 21, 4, 23, 1, 0, 17, 18, 10]','[4]',0.00000000,'2025-05-19 00:17:46','2025-05-19 00:17:52'),(12,'01JV4YB5Z6MHAZMA1B4582K6RN',100.00000000,2,2,43,9,'[10, 0, 23, 15, 12, 3, 20, 1, 22]','[15]',0.00000000,'2025-05-19 00:17:58','2025-05-19 00:18:00'),(13,'01JV4YB5Z6MHAZMA1B4582K6RN',100.00000000,2,2,44,9,'[16, 14, 17, 13, 18, 5, 10, 11, 2]','[8]',145.00000000,'2025-05-19 00:18:01','2025-05-19 00:18:07'),(14,'01JX5TNEM0RA789TS51N1NFCMJ',12500.00000000,3,3,1,3,'[19, 9, 1]','[5]',13125.00000000,'2025-06-07 18:34:08','2025-06-07 18:34:10'),(15,'01JV4YB5Z6MHAZMA1B4582K6RN',100.00000000,2,2,45,3,'[4, 20, 16]','[10, 16]',0.00000000,'2025-06-08 20:43:54','2025-06-08 20:43:56'),(16,'01JV4YB5Z6MHAZMA1B4582K6RN',1600.00000000,2,2,46,3,'[15, 6, 8]','[11, 15]',0.00000000,'2025-06-08 20:44:10','2025-06-08 20:44:18'),(17,'01JV4YB5Z6MHAZMA1B4582K6RN',1600.00000000,2,2,47,3,'[6, 3, 7]','[11, 7]',0.00000000,'2025-06-08 20:44:23','2025-06-08 20:44:26'),(18,'01JV4YB5Z6MHAZMA1B4582K6RN',1600.00000000,2,2,48,3,'[7, 23, 24]','[11, 12, 7]',0.00000000,'2025-06-08 20:44:27','2025-06-08 20:44:30'),(19,'01JV4YB5Z6MHAZMA1B4582K6RN',1600.00000000,2,2,49,3,'[12, 6, 8]','[11, 12]',0.00000000,'2025-06-08 20:44:31','2025-06-08 20:44:32'),(20,'01JV4YB5Z6MHAZMA1B4582K6RN',1600.00000000,2,2,50,3,'[23, 18, 20]','[18]',0.00000000,'2025-06-08 20:44:34','2025-06-08 20:44:38'),(21,'01JV4YB5Z6MHAZMA1B4582K6RN',1600.00000000,2,2,51,3,'[17, 11, 3]','[10, 8, 13, 24, 20]',2992.00000000,'2025-06-08 20:44:42','2025-06-08 20:45:03'),(22,'01JV4YB5Z6MHAZMA1B4582K6RN',1600.00000000,2,2,52,3,'[23, 0, 8]','[5, 3, 13, 17]',2560.00000000,'2025-06-08 20:45:06','2025-06-08 20:45:18'),(23,'01JV4YB5Z6MHAZMA1B4582K6RN',1600.00000000,2,2,53,3,'[13, 8, 20]','[6, 0, 15]',2208.00000000,'2025-06-08 20:45:21','2025-06-08 20:45:34'),(24,'01JV4YB5Z6MHAZMA1B4582K6RN',1600.00000000,2,2,54,3,'[17, 4, 8]','[6, 21, 18, 14, 2]',2992.00000000,'2025-06-08 20:45:38','2025-06-08 20:45:55'),(25,'01JV4YB5Z6MHAZMA1B4582K6RN',1600.00000000,2,2,55,3,'[21, 3, 8]','[5]',1680.00000000,'2025-06-08 20:46:06','2025-06-08 20:46:18'),(26,'01JV4YB5Z6MHAZMA1B4582K6RN',1600.00000000,2,2,56,5,'[8, 1, 9, 5, 7]','[5]',0.00000000,'2025-06-08 20:46:22','2025-06-08 20:46:24'),(27,'01JV4YB5Z6MHAZMA1B4582K6RN',1600.00000000,2,2,57,5,'[5, 23, 7, 21, 11]','[5]',0.00000000,'2025-06-08 20:46:27','2025-06-08 20:46:28'),(28,'01JV4YB5Z6MHAZMA1B4582K6RN',1600.00000000,2,2,58,5,'[2, 22, 9, 23, 15]','[5, 11, 10, 4]',3872.00000000,'2025-06-08 20:46:31','2025-06-08 20:46:43'),(29,'01JV4YB5Z6MHAZMA1B4582K6RN',1600.00000000,2,2,59,5,'[5, 12, 17, 14, 6]','[11, 3, 19, 0, 20]',5072.00000000,'2025-06-08 20:46:46','2025-06-08 20:47:06'),(30,'01JV4YB5Z6MHAZMA1B4582K6RN',100.00000000,2,2,60,3,'[6, 22, 24]','[8, 5, 18]',138.00000000,'2025-06-08 20:47:38','2025-06-08 20:47:47'),(31,'01JV4YB5Z6MHAZMA1B4582K6RN',100.00000000,2,2,61,3,'[0, 9, 18]','[1, 18]',0.00000000,'2025-06-08 20:47:49','2025-06-08 20:47:53'),(32,'01JV4YB5Z6MHAZMA1B4582K6RN',100.00000000,2,2,62,3,'[7, 1, 24]','[10, 7]',0.00000000,'2025-06-08 20:47:55','2025-06-08 20:48:01'),(33,'01JV4YB5Z6MHAZMA1B4582K6RN',100.00000000,2,2,63,3,'[16, 22, 1]','[6, 23, 14, 15, 0]',187.00000000,'2025-06-08 20:48:03','2025-06-08 20:48:21'),(34,'01JV4YB5Z6MHAZMA1B4582K6RN',738.00000000,2,2,64,3,'[24, 12, 20]','[0, 18, 9]',1018.44000000,'2025-06-08 20:48:23','2025-06-08 20:48:30'),(35,'01JV4YB5Z6MHAZMA1B4582K6RN',738.00000000,2,2,65,3,'[23, 14, 18]','[0, 18]',0.00000000,'2025-06-08 20:48:31','2025-06-08 20:48:36'),(36,'01JV4YB5Z6MHAZMA1B4582K6RN',467.44000000,2,2,66,3,'[19, 4, 20]','[5, 17, 20]',0.00000000,'2025-06-08 20:48:41','2025-06-08 20:48:46'),(37,'01JV4YB5Z6MHAZMA1B4582K6RN',1600.00000000,2,2,67,3,'[9, 1, 5]','[5]',0.00000000,'2025-06-08 20:50:17','2025-06-08 20:50:18'),(38,'01JV4YB5Z6MHAZMA1B4582K6RN',1600.00000000,2,2,68,3,'[13, 17, 20]','[5, 3, 23, 15]',2560.00000000,'2025-06-08 20:51:01','2025-06-08 20:51:10'),(39,'01JV4YB5Z6MHAZMA1B4582K6RN',1600.00000000,2,2,69,3,'[10, 20, 2]','[6, 9, 2]',0.00000000,'2025-06-08 20:51:12','2025-06-08 20:51:16'),(40,'01JV4YB5Z6MHAZMA1B4582K6RN',1600.00000000,2,2,70,3,'[10, 4, 17]','[6, 4]',0.00000000,'2025-06-08 20:51:20','2025-06-08 20:53:57'),(41,'01JV4YB5Z6MHAZMA1B4582K6RN',205.20000000,2,2,71,3,'[1, 4, 19]','[0, 17, 4]',0.00000000,'2025-06-08 20:53:59','2025-06-08 20:54:14'),(42,'01JV4YB5Z6MHAZMA1B4582K6RN',100.00000000,2,2,72,3,'[8, 0, 17]','[5, 11]',120.00000000,'2025-06-08 21:43:21','2025-06-08 21:43:25');
/*!40000 ALTER TABLE `mines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` char(26) NOT NULL,
  `type` varchar(100) NOT NULL,
  `content` json DEFAULT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_notifications_userId` (`userId`),
  CONSTRAINT `fk_notifications_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (7,'01JV4YB5Z6MHAZMA1B4582K6RN','level-up','{\"level\": 2}',1,'2025-05-13 19:16:23'),(8,'01JV4YB5Z6MHAZMA1B4582K6RN','level-up','{\"level\": 3}',1,'2025-05-16 13:04:51'),(9,'01JV4YB5Z6MHAZMA1B4582K6RN','level-up','{\"level\": 4}',1,'2025-05-16 13:41:58'),(10,'01JV4YB5Z6MHAZMA1B4582K6RN','level-up','{\"level\": 5}',1,'2025-05-16 14:15:49'),(11,'01JV4YB5Z6MHAZMA1B4582K6RN','level-up','{\"level\": 6}',1,'2025-05-16 14:15:52'),(12,'01JV4YB5Z6MHAZMA1B4582K6RN','level-up','{\"level\": 7}',1,'2025-05-16 14:54:19'),(13,'01JV4YB5Z6MHAZMA1B4582K6RN','level-up','{\"level\": 8}',1,'2025-05-16 15:18:59'),(14,'01JV4YB5Z6MHAZMA1B4582K6RN','level-up','{\"level\": 9}',1,'2025-05-18 22:13:58'),(15,'01JV4YB5Z6MHAZMA1B4582K6RN','level-up','{\"level\": 10}',1,'2025-05-18 22:16:03'),(16,'01JV4YB5Z6MHAZMA1B4582K6RN','level-up','{\"level\": 11}',1,'2025-05-18 22:21:38'),(17,'01JV4YB5Z6MHAZMA1B4582K6RN','level-up','{\"level\": 12}',1,'2025-05-18 22:23:38'),(18,'01JV4YB5Z6MHAZMA1B4582K6RN','level-up','{\"level\": 13}',1,'2025-05-18 22:31:56'),(19,'01JV4YB5Z6MHAZMA1B4582K6RN','level-up','{\"level\": 14}',1,'2025-05-18 22:34:24'),(20,'01JV4YB5Z6MHAZMA1B4582K6RN','level-up','{\"level\": 15}',1,'2025-05-18 22:35:32'),(21,'01JV4YB5Z6MHAZMA1B4582K6RN','level-up','{\"level\": 16}',1,'2025-05-18 23:43:06'),(22,'01JV4YB5Z6MHAZMA1B4582K6RN','level-up','{\"level\": 17}',1,'2025-05-18 23:44:00'),(23,'01JV4YB5Z6MHAZMA1B4582K6RN','level-up','{\"level\": 18}',1,'2025-05-18 23:46:49'),(24,'01JV4YB5Z6MHAZMA1B4582K6RN','level-up','{\"level\": 19}',1,'2025-05-18 23:50:10'),(25,'01JV4YB5Z6MHAZMA1B4582K6RN','level-up','{\"level\": 20}',1,'2025-05-18 23:51:29'),(26,'01JV4YB5Z6MHAZMA1B4582K6RN','level-up','{\"level\": 21}',1,'2025-05-18 23:55:09'),(27,'01JV4YB5Z6MHAZMA1B4582K6RN','level-up','{\"level\": 22}',1,'2025-05-18 23:56:26'),(28,'01JX5TNEM0RA789TS51N1NFCMJ','level-up','{\"level\": 3}',0,'2025-06-07 18:34:08'),(29,'01JV4YB5Z6MHAZMA1B4582K6RN','level-up','{\"level\": 23}',1,'2025-06-08 20:51:20'),(30,'01JV4YB5Z6MHAZMA1B4582K6RN','level-up','{\"level\": 24}',0,'2025-06-11 23:05:22'),(31,'01JV4YB5Z6MHAZMA1B4582K6RN','level-up','{\"level\": 25}',0,'2025-06-12 00:45:17'),(32,'01JV4YB5Z6MHAZMA1B4582K6RN','level-up','{\"level\": 26}',0,'2025-06-12 00:50:00'),(33,'01JV4YB5Z6MHAZMA1B4582K6RN','level-up','{\"level\": 27}',0,'2025-06-12 00:54:22'),(34,'01JV4YB5Z6MHAZMA1B4582K6RN','level-up','{\"level\": 28}',0,'2025-06-12 00:58:19'),(35,'01JV4YB5Z6MHAZMA1B4582K6RN','level-up','{\"level\": 29}',0,'2025-06-12 01:00:47'),(36,'01JV4YB5Z6MHAZMA1B4582K6RN','level-up','{\"level\": 30}',0,'2025-06-12 01:07:02'),(37,'01JV4YB5Z6MHAZMA1B4582K6RN','level-up','{\"level\": 31}',0,'2025-06-12 01:14:16'),(38,'01JV4YB5Z6MHAZMA1B4582K6RN','level-up','{\"level\": 32}',0,'2025-06-12 01:20:19'),(39,'01JV4YB5Z6MHAZMA1B4582K6RN','level-up','{\"level\": 33}',0,'2025-06-12 01:29:21'),(40,'01JV4YB5Z6MHAZMA1B4582K6RN','level-up','{\"level\": 34}',0,'2025-06-12 01:35:46'),(41,'01JV4YB5Z6MHAZMA1B4582K6RN','level-up','{\"level\": 35}',0,'2025-06-12 01:41:32'),(42,'01JV4YB5Z6MHAZMA1B4582K6RN','level-up','{\"level\": 36}',0,'2025-06-12 01:45:04'),(43,'01JV4YB5Z6MHAZMA1B4582K6RN','level-up','{\"level\": 37}',0,'2025-06-12 01:48:26'),(44,'01JV4YB5Z6MHAZMA1B4582K6RN','level-up','{\"level\": 38}',0,'2025-06-12 01:51:49'),(45,'01JV4YB5Z6MHAZMA1B4582K6RN','level-up','{\"level\": 39}',0,'2025-06-12 01:56:09');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` char(26) NOT NULL,
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `phone_verification_tokens`
--

DROP TABLE IF EXISTS `phone_verification_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `phone_verification_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` char(26) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `token` varchar(6) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `attempts` int NOT NULL DEFAULT '0',
  `used` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `userId_phone_idx` (`userId`,`phone`),
  KEY `expires_at_idx` (`expires_at`),
  CONSTRAINT `fk_phone_verification_tokens_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phone_verification_tokens`
--

LOCK TABLES `phone_verification_tokens` WRITE;
/*!40000 ALTER TABLE `phone_verification_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `phone_verification_tokens` ENABLE KEYS */;
UNLOCK TABLES;

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
  `userId` char(26) NOT NULL,
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
  `host` char(26) DEFAULT NULL,
  `amount` decimal(20,8) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `endedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_rains_host` (`host`),
  CONSTRAINT `fk_rains_host` FOREIGN KEY (`host`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=181 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rains`
--

LOCK TABLES `rains` WRITE;
/*!40000 ALTER TABLE `rains` DISABLE KEYS */;
INSERT INTO `rains` VALUES (25,NULL,200.00000000,'2025-05-13 13:41:10','2025-05-13 14:11:10'),(26,NULL,200.00000000,'2025-05-13 14:11:10','2025-05-13 14:41:10'),(27,NULL,200.00000000,'2025-05-13 14:41:10','2025-05-13 15:38:43'),(28,NULL,200.00000000,'2025-05-13 15:38:43','2025-05-13 16:08:43'),(29,NULL,200.00000000,'2025-05-13 16:08:43','2025-05-13 16:38:43'),(30,NULL,200.00000000,'2025-05-13 16:38:43','2025-05-13 17:08:43'),(31,NULL,200.00000000,'2025-05-13 17:08:43','2025-05-13 17:38:43'),(32,NULL,200.00000000,'2025-05-13 17:38:43','2025-05-13 18:08:43'),(33,NULL,200.00000000,'2025-05-13 18:08:43','2025-05-13 18:38:43'),(34,NULL,200.00000000,'2025-05-13 18:38:43','2025-05-13 19:08:43'),(35,NULL,200.00000000,'2025-05-13 19:08:43','2025-05-15 13:00:03'),(36,NULL,200.00000000,'2025-05-15 13:00:03','2025-05-15 13:30:03'),(37,NULL,200.00000000,'2025-05-15 13:30:03','2025-05-15 14:00:03'),(38,NULL,200.00000000,'2025-05-15 14:00:03','2025-05-15 14:30:03'),(39,NULL,200.00000000,'2025-05-15 14:30:03','2025-05-15 15:00:03'),(40,NULL,200.00000000,'2025-05-15 15:00:03','2025-05-15 19:33:39'),(41,NULL,200.00000000,'2025-05-15 19:33:39','2025-05-15 20:03:39'),(42,NULL,200.00000000,'2025-05-15 20:03:39','2025-05-16 12:13:52'),(43,NULL,200.00000000,'2025-05-16 12:13:52','2025-05-16 12:43:52'),(44,NULL,200.00000000,'2025-05-16 12:43:52','2025-05-16 13:13:52'),(45,NULL,200.00000000,'2025-05-16 13:13:52','2025-05-16 13:43:52'),(46,NULL,200.00000000,'2025-05-16 13:43:52','2025-05-16 14:13:52'),(47,NULL,200.00000000,'2025-05-16 14:13:52','2025-05-16 14:46:03'),(48,NULL,200.00000000,'2025-05-16 14:46:03','2025-05-16 15:16:03'),(49,NULL,200.00000000,'2025-05-16 15:16:03','2025-05-16 20:57:21'),(50,NULL,200.00000000,'2025-05-16 20:57:21','2025-05-16 21:27:21'),(51,NULL,200.00000000,'2025-05-16 21:27:21','2025-05-17 10:30:33'),(52,NULL,200.00000000,'2025-05-17 10:30:33','2025-05-17 11:00:33'),(53,NULL,200.00000000,'2025-05-17 11:00:33','2025-05-17 11:30:33'),(54,NULL,200.00000000,'2025-05-17 11:30:33','2025-05-17 12:00:33'),(55,NULL,200.00000000,'2025-05-17 12:00:33','2025-05-17 12:30:33'),(56,NULL,200.00000000,'2025-05-17 12:30:33','2025-05-17 13:00:33'),(57,NULL,200.00000000,'2025-05-17 13:00:33','2025-05-17 19:21:44'),(58,NULL,200.00000000,'2025-05-17 19:21:44','2025-05-17 19:51:44'),(59,NULL,200.00000000,'2025-05-17 19:51:44','2025-05-17 20:21:44'),(60,NULL,200.00000000,'2025-05-17 20:21:44','2025-05-17 20:51:44'),(61,NULL,200.00000000,'2025-05-17 20:51:44','2025-05-17 21:21:44'),(62,NULL,200.00000000,'2025-05-17 21:21:44','2025-05-17 21:51:44'),(63,NULL,200.00000000,'2025-05-17 21:51:44','2025-05-17 22:21:44'),(64,NULL,200.00000000,'2025-05-17 22:21:44','2025-05-17 22:54:57'),(65,NULL,200.00000000,'2025-05-17 22:54:57','2025-05-17 23:27:02'),(66,NULL,200.00000000,'2025-05-17 23:27:02','2025-05-17 23:57:02'),(67,NULL,200.00000000,'2025-05-17 23:57:02','2025-05-18 00:27:02'),(68,NULL,200.00000000,'2025-05-18 00:27:02','2025-05-18 12:31:22'),(69,NULL,200.00000000,'2025-05-18 12:31:22','2025-05-18 13:01:22'),(70,NULL,200.00000000,'2025-05-18 13:01:22','2025-05-18 13:31:22'),(71,NULL,200.00000000,'2025-05-18 13:31:22','2025-05-18 14:01:22'),(72,NULL,200.00000000,'2025-05-18 14:01:22','2025-05-18 14:31:22'),(73,NULL,200.00000000,'2025-05-18 14:31:22','2025-05-18 21:35:30'),(74,NULL,200.00000000,'2025-05-18 21:35:30','2025-05-18 22:05:30'),(75,NULL,200.00000000,'2025-05-18 22:05:30','2025-05-18 22:35:30'),(76,NULL,200.00000000,'2025-05-18 22:35:30','2025-05-18 23:05:30'),(77,NULL,200.00000000,'2025-05-18 23:05:30','2025-05-18 23:35:30'),(78,NULL,200.00000000,'2025-05-18 23:35:30','2025-05-19 00:05:30'),(79,NULL,200.00000000,'2025-05-19 00:05:30','2025-05-19 00:35:30'),(80,NULL,200.00000000,'2025-05-19 00:35:30','2025-05-30 22:05:57'),(81,NULL,200.00000000,'2025-05-30 22:05:57','2025-05-30 22:35:57'),(82,NULL,200.00000000,'2025-05-30 22:35:57','2025-05-30 23:05:57'),(83,NULL,200.00000000,'2025-05-30 23:05:57','2025-05-30 23:35:57'),(84,NULL,200.00000000,'2025-05-30 23:35:57','2025-05-31 00:05:57'),(85,NULL,200.00000000,'2025-05-31 00:05:57','2025-05-31 00:35:57'),(86,NULL,200.00000000,'2025-05-31 00:35:57','2025-05-31 01:05:57'),(87,NULL,200.00000000,'2025-05-31 01:05:57','2025-05-31 01:35:57'),(88,NULL,200.00000000,'2025-05-31 01:35:57','2025-05-31 02:05:57'),(89,NULL,200.00000000,'2025-05-31 02:05:57','2025-05-31 02:35:57'),(90,NULL,200.00000000,'2025-05-31 02:35:57','2025-05-31 03:05:57'),(91,NULL,200.00000000,'2025-05-31 03:05:57','2025-05-31 03:35:57'),(92,NULL,200.00000000,'2025-05-31 03:35:57','2025-05-31 04:05:57'),(93,NULL,200.00000000,'2025-05-31 04:05:57','2025-05-31 04:35:57'),(94,NULL,200.00000000,'2025-05-31 04:35:57','2025-05-31 15:37:00'),(95,NULL,200.00000000,'2025-05-31 15:37:00','2025-05-31 16:07:00'),(96,NULL,200.00000000,'2025-05-31 16:07:00','2025-05-31 16:37:00'),(97,NULL,200.00000000,'2025-05-31 16:37:00','2025-05-31 17:07:00'),(98,NULL,200.00000000,'2025-05-31 17:07:00','2025-05-31 17:37:00'),(99,NULL,200.00000000,'2025-05-31 17:37:00','2025-05-31 18:07:00'),(100,NULL,200.00000000,'2025-05-31 18:07:00','2025-05-31 18:37:00'),(101,NULL,200.00000000,'2025-05-31 18:37:00','2025-06-01 15:18:19'),(102,NULL,200.00000000,'2025-06-01 15:18:20','2025-06-01 15:48:20'),(103,NULL,200.00000000,'2025-06-01 15:48:20','2025-06-01 16:18:20'),(104,NULL,200.00000000,'2025-06-01 16:18:20','2025-06-01 16:48:20'),(105,NULL,200.00000000,'2025-06-01 16:48:20','2025-06-01 17:18:20'),(106,NULL,200.00000000,'2025-06-01 17:18:20','2025-06-01 17:48:20'),(107,NULL,200.00000000,'2025-06-01 17:48:20','2025-06-01 18:18:20'),(108,NULL,200.00000000,'2025-06-01 18:18:20','2025-06-01 18:48:20'),(109,NULL,200.00000000,'2025-06-01 18:48:20','2025-06-01 19:18:20'),(110,NULL,200.00000000,'2025-06-01 19:18:20','2025-06-01 19:48:20'),(111,NULL,200.00000000,'2025-06-01 19:48:20','2025-06-01 20:18:20'),(112,NULL,200.00000000,'2025-06-01 20:18:20','2025-06-01 20:48:20'),(113,NULL,200.00000000,'2025-06-01 20:48:20','2025-06-01 21:18:20'),(114,NULL,200.00000000,'2025-06-01 21:18:20','2025-06-02 13:20:33'),(115,NULL,200.00000000,'2025-06-02 13:20:33','2025-06-02 13:50:33'),(116,NULL,200.00000000,'2025-06-02 13:50:33','2025-06-02 17:18:48'),(117,NULL,200.00000000,'2025-06-02 17:18:48','2025-06-02 17:48:48'),(118,NULL,200.00000000,'2025-06-02 17:48:48','2025-06-02 18:18:48'),(119,NULL,200.00000000,'2025-06-02 18:18:48','2025-06-02 18:48:48'),(120,NULL,200.00000000,'2025-06-02 18:48:48','2025-06-03 09:58:39'),(121,NULL,200.00000000,'2025-06-03 09:58:39','2025-06-03 11:42:23'),(122,NULL,200.00000000,'2025-06-03 11:42:23','2025-06-03 12:12:24'),(123,NULL,200.00000000,'2025-06-03 12:12:24','2025-06-03 12:42:24'),(124,NULL,200.00000000,'2025-06-03 12:42:24','2025-06-06 19:24:54'),(125,NULL,200.00000000,'2025-06-06 19:24:54','2025-06-06 19:54:54'),(126,NULL,200.00000000,'2025-06-06 19:54:54','2025-06-07 12:33:03'),(127,NULL,200.00000000,'2025-06-07 12:33:03','2025-06-07 13:04:05'),(128,NULL,200.00000000,'2025-06-07 13:04:05','2025-06-07 13:34:05'),(129,NULL,200.00000000,'2025-06-07 13:34:05','2025-06-07 14:04:05'),(130,NULL,200.00000000,'2025-06-07 14:04:05','2025-06-07 14:34:05'),(131,NULL,200.00000000,'2025-06-07 14:34:05','2025-06-07 15:04:05'),(132,NULL,200.00000000,'2025-06-07 15:04:05','2025-06-07 15:38:17'),(133,NULL,200.00000000,'2025-06-07 16:16:04','2025-06-07 17:37:09'),(134,NULL,200.00000000,'2025-06-07 17:37:09','2025-06-07 18:07:09'),(135,NULL,200.00000000,'2025-06-07 18:07:09','2025-06-07 18:37:09'),(136,NULL,200.00000000,'2025-06-07 18:37:09','2025-06-07 19:07:09'),(137,NULL,200.00000000,'2025-06-07 19:07:09','2025-06-07 19:37:09'),(138,NULL,200.00000000,'2025-06-07 19:37:09','2025-06-07 20:07:09'),(139,NULL,200.00000000,'2025-06-07 20:07:09','2025-06-07 20:37:09'),(140,NULL,200.00000000,'2025-06-07 20:37:09','2025-06-07 21:07:09'),(141,NULL,200.00000000,'2025-06-07 21:07:09','2025-06-08 14:50:31'),(142,NULL,200.00000000,'2025-06-08 14:50:31','2025-06-08 15:20:31'),(143,NULL,200.00000000,'2025-06-08 15:20:31','2025-06-08 15:50:31'),(144,NULL,200.00000000,'2025-06-08 15:50:31','2025-06-08 16:20:31'),(145,NULL,200.00000000,'2025-06-08 16:20:31','2025-06-08 16:54:18'),(146,NULL,200.00000000,'2025-06-08 16:54:18','2025-06-08 17:24:18'),(147,NULL,200.00000000,'2025-06-08 17:24:18','2025-06-08 17:54:18'),(148,NULL,200.00000000,'2025-06-08 17:54:18','2025-06-08 18:24:18'),(149,NULL,200.00000000,'2025-06-08 18:24:18','2025-06-08 18:54:18'),(150,NULL,200.00000000,'2025-06-08 18:54:18','2025-06-08 19:24:18'),(151,NULL,200.00000000,'2025-06-08 19:24:18','2025-06-08 20:37:57'),(152,NULL,200.00000000,'2025-06-08 20:37:57','2025-06-08 21:07:57'),(153,NULL,200.00000000,'2025-06-08 21:07:57','2025-06-08 21:37:57'),(154,NULL,200.00000000,'2025-06-08 21:37:57','2025-06-09 13:27:46'),(155,NULL,200.00000000,'2025-06-09 13:27:46','2025-06-09 13:57:46'),(156,NULL,200.00000000,'2025-06-09 13:57:46','2025-06-09 14:27:46'),(157,NULL,200.00000000,'2025-06-09 14:27:46','2025-06-09 14:57:46'),(158,NULL,200.00000000,'2025-06-09 14:57:46','2025-06-09 15:29:32'),(159,NULL,200.00000000,'2025-06-09 15:29:32','2025-06-09 16:13:19'),(160,NULL,200.00000000,'2025-06-09 16:13:19','2025-06-11 18:07:37'),(161,NULL,200.00000000,'2025-06-11 18:07:37','2025-06-11 18:37:37'),(162,NULL,200.00000000,'2025-06-11 18:37:37','2025-06-11 19:30:42'),(163,NULL,200.00000000,'2025-06-11 19:30:42','2025-06-11 20:00:42'),(164,NULL,200.00000000,'2025-06-11 20:00:42','2025-06-11 20:30:42'),(165,NULL,200.00000000,'2025-06-11 20:30:42','2025-06-11 21:00:42'),(166,NULL,200.00000000,'2025-06-11 21:00:42','2025-06-11 21:30:42'),(167,NULL,200.00000000,'2025-06-11 21:30:42','2025-06-11 22:00:42'),(168,NULL,200.00000000,'2025-06-11 22:00:42','2025-06-11 22:43:14'),(169,NULL,200.00000000,'2025-06-11 22:43:14','2025-06-11 23:13:14'),(170,NULL,200.00000000,'2025-06-11 23:13:14','2025-06-11 23:43:14'),(171,NULL,200.00000000,'2025-06-11 23:43:14','2025-06-12 00:13:14'),(172,NULL,200.00000000,'2025-06-12 00:13:14','2025-06-12 00:43:14'),(173,NULL,200.00000000,'2025-06-12 00:43:14','2025-06-12 01:13:14'),(174,NULL,200.00000000,'2025-06-12 01:13:14','2025-06-12 01:43:14'),(175,NULL,200.00000000,'2025-06-12 01:43:14','2025-06-12 20:15:18'),(176,NULL,200.00000000,'2025-06-12 20:15:18','2025-06-12 20:45:18'),(177,NULL,200.00000000,'2025-06-12 20:45:18','2025-06-12 21:15:18'),(178,NULL,200.00000000,'2025-06-12 21:15:18','2025-06-12 21:49:31'),(179,NULL,200.00000000,'2025-06-12 21:49:31','2025-06-12 22:19:31'),(180,NULL,200.00000000,'2025-06-12 22:19:31',NULL);
/*!40000 ALTER TABLE `rains` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rainTips`
--

DROP TABLE IF EXISTS `rainTips`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rainTips` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` char(26) NOT NULL,
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
  `userId` char(26) NOT NULL,
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
  `userId` char(26) NOT NULL,
  `type` varchar(50) NOT NULL,
  `amount` decimal(20,8) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `userId_type_idx` (`userId`,`type`),
  CONSTRAINT `fk_rakebackClaims_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rakebackClaims`
--

LOCK TABLES `rakebackClaims` WRITE;
/*!40000 ALTER TABLE `rakebackClaims` DISABLE KEYS */;
/*!40000 ALTER TABLE `rakebackClaims` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `robuxExchanges`
--

DROP TABLE IF EXISTS `robuxExchanges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `robuxExchanges` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` char(26) NOT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=2883 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `rouletteBets`
--

DROP TABLE IF EXISTS `rouletteBets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rouletteBets` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` char(26) NOT NULL,
  `roundId` bigint unsigned NOT NULL,
  `color` int NOT NULL,
  `amount` decimal(20,8) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `roundId_idx` (`roundId`),
  KEY `userId_idx` (`userId`),
  CONSTRAINT `fk_rouletteBets_roundId` FOREIGN KEY (`roundId`) REFERENCES `roulette` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rouletteBets_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rouletteBets`
--

LOCK TABLES `rouletteBets` WRITE;
/*!40000 ALTER TABLE `rouletteBets` DISABLE KEYS */;
INSERT INTO `rouletteBets` VALUES (1,'01JV4YB5Z6MHAZMA1B4582K6RN',5,1,10.00000000,'2025-05-13 18:46:46','2025-05-13 18:46:46'),(2,'01JV4YB5Z6MHAZMA1B4582K6RN',5,0,40.00000000,'2025-05-13 18:46:49','2025-05-13 18:46:50'),(3,'01JV4YB5Z6MHAZMA1B4582K6RN',7,2,500.00000000,'2025-05-16 12:56:51','2025-05-16 12:56:51'),(4,'01JV4YB5Z6MHAZMA1B4582K6RN',8,1,1010.00000000,'2025-05-16 12:58:40','2025-05-16 12:58:40'),(5,'01JV4YB5Z6MHAZMA1B4582K6RN',9,1,1010.00000000,'2025-05-16 12:59:04','2025-05-16 12:59:04'),(6,'01JV4YB5Z6MHAZMA1B4582K6RN',11,0,500.00000000,'2025-05-16 13:00:47','2025-05-16 13:00:47'),(7,'01JV4YB5Z6MHAZMA1B4582K6RN',12,1,500.00000000,'2025-05-16 13:01:03','2025-05-16 13:01:03'),(8,'01JV4YB5Z6MHAZMA1B4582K6RN',13,0,500.00000000,'2025-05-16 13:01:22','2025-05-16 13:01:22'),(9,'01JV4YB5Z6MHAZMA1B4582K6RN',24,2,500.00000000,'2025-05-16 13:04:51','2025-05-16 13:04:51'),(10,'01JV4YB5Z6MHAZMA1B4582K6RN',31,1,4119.00000000,'2025-05-16 13:09:36','2025-05-16 13:09:36'),(11,'01JV4YB5Z6MHAZMA1B4582K6RN',33,1,1000.00000000,'2025-05-16 13:10:17','2025-05-16 13:10:17'),(12,'01JV4YB5Z6MHAZMA1B4582K6RN',35,0,1000.00000000,'2025-05-16 13:10:48','2025-05-16 13:10:48'),(13,'01JV4YB5Z6MHAZMA1B4582K6RN',38,1,500.00000000,'2025-05-16 13:12:54','2025-05-16 13:12:54'),(14,'01JV4YB5Z6MHAZMA1B4582K6RN',39,1,500.00000000,'2025-05-16 13:13:17','2025-05-16 13:13:17'),(15,'01JV4YB5Z6MHAZMA1B4582K6RN',44,1,500.00000000,'2025-05-16 13:14:40','2025-05-16 13:14:40'),(16,'01JV4YB5Z6MHAZMA1B4582K6RN',73,2,500.00000000,'2025-05-16 13:25:35','2025-05-16 13:25:35'),(17,'01JV4YB5Z6MHAZMA1B4582K6RN',104,1,500.00000000,'2025-05-16 13:41:20','2025-05-16 13:41:20'),(18,'01JV4YB5Z6MHAZMA1B4582K6RN',106,1,1500.00000000,'2025-05-16 13:41:58','2025-05-16 13:41:58'),(19,'01JV4YB5Z6MHAZMA1B4582K6RN',113,1,1500.00000000,'2025-05-16 13:43:55','2025-05-16 13:43:55'),(20,'01JV4YB5Z6MHAZMA1B4582K6RN',113,0,1500.00000000,'2025-05-16 13:43:59','2025-05-16 13:43:59'),(21,'01JV4YB5Z6MHAZMA1B4582K6RN',114,1,1500.00000000,'2025-05-16 13:44:15','2025-05-16 13:44:15'),(22,'01JV4YB5Z6MHAZMA1B4582K6RN',114,0,1500.00000000,'2025-05-16 13:44:16','2025-05-16 13:44:16'),(23,'01JV4YB5Z6MHAZMA1B4582K6RN',116,1,1000.00000000,'2025-05-16 13:47:06','2025-05-16 13:47:06'),(24,'01JV4YB5Z6MHAZMA1B4582K6RN',119,2,1000.00000000,'2025-05-16 13:49:13','2025-05-16 13:49:13'),(25,'01JV4YB5Z6MHAZMA1B4582K6RN',121,2,1000.00000000,'2025-05-16 13:49:55','2025-05-16 13:49:55'),(26,'01JV4YB5Z6MHAZMA1B4582K6RN',123,1,1000.00000000,'2025-05-16 13:50:31','2025-05-16 13:50:31'),(27,'01JV4YB5Z6MHAZMA1B4582K6RN',124,1,1000.00000000,'2025-05-16 13:50:48','2025-05-16 13:50:48'),(28,'01JV4YB5Z6MHAZMA1B4582K6RN',125,1,1000.00000000,'2025-05-16 13:50:59','2025-05-16 13:50:59'),(29,'01JV4YB5Z6MHAZMA1B4582K6RN',127,1,1000.00000000,'2025-05-16 13:52:41','2025-05-16 13:52:41'),(30,'01JV4YB5Z6MHAZMA1B4582K6RN',141,2,500.00000000,'2025-05-16 13:57:37','2025-05-16 13:57:37'),(31,'01JV4YB5Z6MHAZMA1B4582K6RN',165,2,500.00000000,'2025-05-16 14:10:06','2025-05-16 14:10:06'),(32,'01JV4YB5Z6MHAZMA1B4582K6RN',172,1,500.00000000,'2025-05-16 14:12:14','2025-05-16 14:12:14'),(33,'01JV4YB5Z6MHAZMA1B4582K6RN',174,1,500.00000000,'2025-05-16 14:14:06','2025-05-16 14:14:06'),(34,'01JV4YB5Z6MHAZMA1B4582K6RN',180,0,52500.00000000,'2025-05-16 14:15:49','2025-05-16 14:15:54'),(35,'01JV4YB5Z6MHAZMA1B4582K6RN',183,1,1000.00000000,'2025-05-16 14:20:11','2025-05-16 14:20:11'),(36,'01JV4YB5Z6MHAZMA1B4582K6RN',197,1,500.00000000,'2025-05-16 14:25:30','2025-05-16 14:25:30'),(37,'01JV4YB5Z6MHAZMA1B4582K6RN',236,2,1000.00000000,'2025-05-16 14:46:35','2025-05-16 14:46:35'),(38,'01JV4YB5Z6MHAZMA1B4582K6RN',239,2,1000.00000000,'2025-05-16 14:47:40','2025-05-16 14:47:40'),(39,'01JV4YB5Z6MHAZMA1B4582K6RN',246,0,1000.00000000,'2025-05-16 14:52:47','2025-05-16 14:52:47'),(40,'01JV4YB5Z6MHAZMA1B4582K6RN',250,1,2000.00000000,'2025-05-16 14:54:19','2025-05-16 14:54:20'),(41,'01JV4YB5Z6MHAZMA1B4582K6RN',301,1,10.00000000,'2025-05-16 15:14:15','2025-05-16 15:14:15'),(42,'01JV4YB5Z6MHAZMA1B4582K6RN',303,1,1010.00000000,'2025-05-16 15:14:49','2025-05-16 15:14:49'),(43,'01JV4YB5Z6MHAZMA1B4582K6RN',307,1,1010.00000000,'2025-05-16 15:16:02','2025-05-16 15:16:02'),(44,'01JV4YB5Z6MHAZMA1B4582K6RN',308,1,1010.00000000,'2025-05-16 15:16:12','2025-05-16 15:16:12'),(45,'01JV4YB5Z6MHAZMA1B4582K6RN',312,2,500.00000000,'2025-05-16 15:17:26','2025-05-16 15:17:26'),(46,'01JV4YB5Z6MHAZMA1B4582K6RN',312,0,500.00000000,'2025-05-16 15:17:30','2025-05-16 15:17:30'),(47,'01JV4YB5Z6MHAZMA1B4582K6RN',315,1,10000.00000000,'2025-05-16 15:18:26','2025-05-16 15:18:26'),(48,'01JV4YB5Z6MHAZMA1B4582K6RN',316,1,20000.00000000,'2025-05-16 15:18:41','2025-05-16 15:18:41'),(49,'01JV4YB5Z6MHAZMA1B4582K6RN',317,1,20000.00000000,'2025-05-16 15:18:59','2025-05-16 15:18:59'),(50,'01JV4YB5Z6MHAZMA1B4582K6RN',318,2,20000.00000000,'2025-05-16 15:19:20','2025-05-16 15:19:20'),(51,'01JV4YB5Z6MHAZMA1B4582K6RN',1593,1,500.00000000,'2025-05-19 00:14:43','2025-05-19 00:14:43'),(52,'01JV4YB5Z6MHAZMA1B4582K6RN',1689,0,500.00000000,'2025-05-30 22:08:47','2025-05-30 22:08:47'),(53,'01JV4YB5Z6MHAZMA1B4582K6RN',1761,0,500.00000000,'2025-06-01 20:46:35','2025-06-01 20:46:35'),(54,'01JV4YB5Z6MHAZMA1B4582K6RN',1762,1,3500.00000000,'2025-06-01 20:46:47','2025-06-01 20:46:54'),(55,'01JV4YB5Z6MHAZMA1B4582K6RN',1762,0,4000.00000000,'2025-06-01 20:46:48','2025-06-01 20:46:55'),(56,'01JV4YB5Z6MHAZMA1B4582K6RN',1763,1,2000.00000000,'2025-06-01 20:47:04','2025-06-01 20:47:13'),(57,'01JV4YB5Z6MHAZMA1B4582K6RN',1763,0,1000.00000000,'2025-06-01 20:47:05','2025-06-01 20:47:05'),(58,'01JV4YB5Z6MHAZMA1B4582K6RN',1764,1,1500.00000000,'2025-06-01 20:47:22','2025-06-01 20:47:24'),(59,'01JV4YB5Z6MHAZMA1B4582K6RN',1985,1,10.00000000,'2025-06-02 13:43:47','2025-06-02 13:43:47'),(60,'01JV4YB5Z6MHAZMA1B4582K6RN',1985,0,10.00000000,'2025-06-02 13:43:48','2025-06-02 13:43:48');
/*!40000 ALTER TABLE `rouletteBets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `security_logs`
--

DROP TABLE IF EXISTS `security_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `security_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` char(26) NOT NULL,
  `event_type` varchar(50) NOT NULL,
  `description` text NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `userId_event_idx` (`userId`,`event_type`),
  KEY `createdAt_idx` (`createdAt`),
  CONSTRAINT `fk_security_logs_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `security_logs`
--

LOCK TABLES `security_logs` WRITE;
/*!40000 ALTER TABLE `security_logs` DISABLE KEYS */;
INSERT INTO `security_logs` VALUES (1,'01JV4YB5Z6MHAZMA1B4582K6RN','financial_limits_changed','Financial limits updated','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0',NULL,'{\"url\": \"/limits\", \"method\": \"POST\", \"headers\": {\"user-agent\": \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0\", \"accept-language\": \"en-US,en;q=0.9\"}, \"timestamp\": 1748799033353}','2025-06-01 17:30:33'),(2,'01JV4YB5Z6MHAZMA1B4582K6RN','financial_limits_changed','Financial limits updated','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0',NULL,'{\"url\": \"/limits\", \"method\": \"POST\", \"headers\": {\"user-agent\": \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0\", \"accept-language\": \"en-US,en;q=0.9\"}, \"timestamp\": 1748799393015}','2025-06-01 17:36:33'),(3,'01JV4YB5Z6MHAZMA1B4582K6RN','financial_limits_changed','Financial limits updated','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0',NULL,'{\"url\": \"/limits\", \"method\": \"POST\", \"headers\": {\"user-agent\": \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0\", \"accept-language\": \"en-US,en;q=0.9\"}, \"timestamp\": 1748799395309}','2025-06-01 17:36:35'),(4,'01JV4YB5Z6MHAZMA1B4582K6RN','financial_limits_changed','Financial limits updated','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0',NULL,'{\"url\": \"/limits\", \"method\": \"POST\", \"headers\": {\"user-agent\": \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0\", \"accept-language\": \"en-US,en;q=0.9\"}, \"timestamp\": 1748799397121}','2025-06-01 17:36:37'),(5,'01JV4YB5Z6MHAZMA1B4582K6RN','financial_limits_changed','Financial limits updated','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0',NULL,'{\"url\": \"/limits\", \"method\": \"POST\", \"headers\": {\"user-agent\": \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0\", \"accept-language\": \"en-US,en;q=0.9\"}, \"timestamp\": 1748799399203}','2025-06-01 17:36:39'),(6,'01JV4YB5Z6MHAZMA1B4582K6RN','financial_limits_changed','Financial limits updated','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0',NULL,'{\"url\": \"/limits\", \"method\": \"POST\", \"headers\": {\"user-agent\": \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0\", \"accept-language\": \"en-US,en;q=0.9\"}, \"timestamp\": 1748799551033}','2025-06-01 17:39:11'),(7,'01JV4YB5Z6MHAZMA1B4582K6RN','financial_limits_changed','Financial limits updated','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0',NULL,'{\"url\": \"/limits\", \"method\": \"POST\", \"headers\": {\"user-agent\": \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0\", \"accept-language\": \"en-US,en;q=0.9\"}, \"timestamp\": 1748799569296}','2025-06-01 17:39:29'),(8,'01JV4YB5Z6MHAZMA1B4582K6RN','financial_limits_changed','Financial limits updated','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0',NULL,'{\"url\": \"/limits\", \"method\": \"POST\", \"headers\": {\"user-agent\": \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0\", \"accept-language\": \"en-US,en;q=0.9\"}, \"timestamp\": 1748799570720}','2025-06-01 17:39:30'),(9,'01JV4YB5Z6MHAZMA1B4582K6RN','financial_limits_changed','Financial limits updated','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0',NULL,'{\"url\": \"/limits\", \"method\": \"POST\", \"headers\": {\"user-agent\": \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0\", \"accept-language\": \"en-US,en;q=0.9\"}, \"timestamp\": 1748799577750}','2025-06-01 17:39:37'),(10,'01JV4YB5Z6MHAZMA1B4582K6RN','financial_limits_changed','Financial limits updated','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0',NULL,'{\"url\": \"/limits\", \"method\": \"POST\", \"headers\": {\"user-agent\": \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0\", \"accept-language\": \"en-US,en;q=0.9\"}, \"timestamp\": 1748799633590}','2025-06-01 17:40:33'),(11,'01JV4YB5Z6MHAZMA1B4582K6RN','notification_settings_changed','Notification preferences updated','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0',NULL,'{\"url\": \"/notifications\", \"method\": \"POST\", \"headers\": {\"user-agent\": \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0\", \"accept-language\": \"en-US,en;q=0.9\"}, \"timestamp\": 1748799671767}','2025-06-01 17:41:11'),(12,'01JV4YB5Z6MHAZMA1B4582K6RN','notification_settings_changed','Notification preferences updated','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0',NULL,'{\"url\": \"/notifications\", \"method\": \"POST\", \"headers\": {\"user-agent\": \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0\", \"accept-language\": \"en-US,en;q=0.9\"}, \"timestamp\": 1748799676467}','2025-06-01 17:41:16');
/*!40000 ALTER TABLE `security_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `serverSeeds`
--

DROP TABLE IF EXISTS `serverSeeds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `serverSeeds` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` char(26) NOT NULL,
  `seed` varchar(255) NOT NULL,
  `hashedSeed` varchar(255) DEFAULT NULL,
  `nonce` bigint unsigned NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `endedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId_endedAt_idx` (`userId`,`endedAt`),
  CONSTRAINT `fk_serverSeeds_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `serverSeeds`
--

LOCK TABLES `serverSeeds` WRITE;
/*!40000 ALTER TABLE `serverSeeds` DISABLE KEYS */;
INSERT INTO `serverSeeds` VALUES (2,'01JV4YB5Z6MHAZMA1B4582K6RN','1867647e24742cfacb07f0c410f9e6028c719d208de48ec9c7bfa23b7ec93554',NULL,72,'2025-05-13 13:46:29',NULL),(3,'01JX5TNEM0RA789TS51N1NFCMJ','5d05cc871cbde719698af6bbfa9c1bba12005989f9ed0798898457877621b1a3',NULL,1,'2025-06-07 18:32:49',NULL);
/*!40000 ALTER TABLE `serverSeeds` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Table structure for table `spinshield_freespins`
--

DROP TABLE IF EXISTS `spinshield_freespins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `spinshield_freespins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` char(26) NOT NULL,
  `game_id` varchar(255) NOT NULL,
  `freespins_count` int NOT NULL,
  `freespins_performed` int NOT NULL DEFAULT '0',
  `bet_level` int NOT NULL DEFAULT '0',
  `freespins_bet` int DEFAULT NULL,
  `freespins_wallet` int NOT NULL DEFAULT '0',
  `currency` varchar(10) NOT NULL DEFAULT 'USD',
  `active` tinyint(1) DEFAULT '1',
  `valid_until` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `spinshield_freespins_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `spinshield_freespins`
--

LOCK TABLES `spinshield_freespins` WRITE;
/*!40000 ALTER TABLE `spinshield_freespins` DISABLE KEYS */;
/*!40000 ALTER TABLE `spinshield_freespins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `spinshield_games`
--

DROP TABLE IF EXISTS `spinshield_games`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `spinshield_games` (
  `id` int NOT NULL AUTO_INCREMENT,
  `game_id` int NOT NULL,
  `game_id_hash` varchar(255) NOT NULL,
  `game_name` varchar(255) NOT NULL,
  `provider` varchar(255) NOT NULL,
  `provider_name` varchar(255) DEFAULT NULL,
  `type` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL,
  `subcategory` varchar(255) DEFAULT NULL,
  `is_new` tinyint(1) DEFAULT '0',
  `is_mobile` tinyint(1) DEFAULT '1',
  `freerounds_supported` tinyint(1) DEFAULT '0',
  `featurebuy_supported` tinyint(1) DEFAULT '0',
  `has_jackpot` tinyint(1) DEFAULT '0',
  `play_for_fun_supported` tinyint(1) DEFAULT '1',
  `image_url` varchar(512) DEFAULT NULL,
  `image_square` varchar(512) DEFAULT NULL,
  `image_portrait` varchar(512) DEFAULT NULL,
  `image_long` varchar(512) DEFAULT NULL,
  `source` varchar(255) DEFAULT NULL,
  `system` varchar(255) DEFAULT NULL,
  `timestamp` int DEFAULT NULL,
  `rtp` decimal(5,2) DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  `external_created_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `popularity` bigint DEFAULT '0',
  `is_featured` tinyint(1) DEFAULT '0',
  `image_blurhash` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_game_id_hash` (`game_id_hash`)
) ENGINE=InnoDB AUTO_INCREMENT=2540 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `surveys`
--

DROP TABLE IF EXISTS `surveys`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `surveys` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` char(26) NOT NULL,
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
  `userId` char(26) NOT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
INSERT INTO `transactions` VALUES (5,'01JX5TNEM0RA789TS51N1NFCMJ',100000.00000000,'in','admin',NULL,NULL,'2025-06-07 18:33:52'),(6,'01JV4YB5Z6MHAZMA1B4582K6RN',1376969.97000000,'out','admin',NULL,NULL,'2025-06-08 20:47:20'),(7,'01JV4YB5Z6MHAZMA1B4582K6RN',1000.00000000,'in','admin',NULL,NULL,'2025-06-08 20:49:25'),(8,'01JV4YB5Z6MHAZMA1B4582K6RN',600.00000000,'in','admin',NULL,NULL,'2025-06-08 20:50:06'),(9,'01JV4YB5Z6MHAZMA1B4582K6RN',3200.00000000,'in','admin',NULL,NULL,'2025-06-08 20:50:52'),(10,'01JV4YB5Z6MHAZMA1B4582K6RN',10000.00000000,'in','admin',NULL,NULL,'2025-06-08 21:05:43'),(11,'01JV4YB5Z6MHAZMA1B4582K6RN',990000.00000000,'in','admin',NULL,NULL,'2025-06-11 22:49:43');
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trusted_devices`
--

DROP TABLE IF EXISTS `trusted_devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trusted_devices` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` char(26) NOT NULL,
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
  UNIQUE KEY `userId_device_unique` (`userId`,`device_id`),
  KEY `last_used_idx` (`last_used`),
  CONSTRAINT `fk_trusted_devices_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trusted_devices`
--

LOCK TABLES `trusted_devices` WRITE;
/*!40000 ALTER TABLE `trusted_devices` DISABLE KEYS */;
/*!40000 ALTER TABLE `trusted_devices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_favorites`
--

DROP TABLE IF EXISTS `user_favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_favorites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` char(26) NOT NULL,
  `game_id_hash` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_game` (`user_id`,`game_id_hash`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_game_id_hash` (`game_id_hash`),
  CONSTRAINT `user_favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_favorites`
--

LOCK TABLES `user_favorites` WRITE;
/*!40000 ALTER TABLE `user_favorites` DISABLE KEYS */;
INSERT INTO `user_favorites` VALUES (2,'01JV4YB5Z6MHAZMA1B4582K6RN','hacksaw/WantedDeadoraWild','2025-06-08 16:12:36'),(3,'01JV4YB5Z6MHAZMA1B4582K6RN','nolimit/SanQuentin2','2025-06-08 16:23:29'),(4,'01JV4YB5Z6MHAZMA1B4582K6RN','nolimit/Outsourced','2025-06-08 16:26:46'),(5,'01JV4YB5Z6MHAZMA1B4582K6RN','spnmnl/BookOfRuby','2025-06-08 18:26:45'),(7,'01JV4YB5Z6MHAZMA1B4582K6RN','nolimit/Loner','2025-06-08 20:39:30'),(8,'01JV4YB5Z6MHAZMA1B4582K6RN','onlyplay/PiggyBonanzaValentine','2025-06-09 15:46:50'),(9,'01JV4YB5Z6MHAZMA1B4582K6RN','hacksaw/ShaolinMaster','2025-06-09 15:46:53');
/*!40000 ALTER TABLE `user_favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_settings`
--

DROP TABLE IF EXISTS `user_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` char(26) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `phone_verified` tinyint(1) NOT NULL DEFAULT '0',
  `email_verified` tinyint(1) NOT NULL DEFAULT '0',
  `two_factor_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `two_factor_secret` varchar(255) DEFAULT NULL,
  `backup_codes` json DEFAULT NULL,
  `session_timeout` int NOT NULL DEFAULT '43200',
  `email_notifications` tinyint(1) NOT NULL DEFAULT '1',
  `sms_notifications` tinyint(1) NOT NULL DEFAULT '0',
  `marketing_emails` tinyint(1) NOT NULL DEFAULT '1',
  `push_notifications` tinyint(1) NOT NULL DEFAULT '1',
  `daily_deposit_limit` decimal(20,8) DEFAULT NULL,
  `weekly_withdrawal_limit` decimal(20,8) DEFAULT NULL,
  `monthly_loss_limit` decimal(20,8) DEFAULT NULL,
  `self_exclusion_until` timestamp NULL DEFAULT NULL,
  `reality_check_interval` int DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_settings`
--

LOCK TABLES `user_settings` WRITE;
/*!40000 ALTER TABLE `user_settings` DISABLE KEYS */;
INSERT INTO `user_settings` VALUES (1,'01JV4YB5Z6MHAZMA1B4582K6RN',NULL,NULL,0,0,0,NULL,NULL,43200,0,0,0,1,NULL,NULL,NULL,NULL,NULL,NULL,1,1,1,1,1,'2025-06-01 16:42:14','2025-06-01 17:41:16'),(2,'01JVJVWQPC3403M4GXQCAHSWFG',NULL,NULL,0,0,0,NULL,NULL,30,1,0,1,1,NULL,NULL,NULL,NULL,NULL,NULL,1,1,1,1,1,'2025-06-01 16:42:14','2025-06-01 16:42:14'),(3,'01JVJWQVHWYZPTC98A92VBCTJY',NULL,NULL,0,0,0,NULL,NULL,30,1,0,1,1,NULL,NULL,NULL,NULL,NULL,NULL,1,1,1,1,1,'2025-06-01 16:42:14','2025-06-01 16:42:14'),(4,'01JVJWR7JRVNXT243T3Y25QP4P',NULL,NULL,0,0,0,NULL,NULL,30,1,0,1,1,NULL,NULL,NULL,NULL,NULL,NULL,1,1,1,1,1,'2025-06-01 16:42:14','2025-06-01 16:42:14');
/*!40000 ALTER TABLE `user_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_tokens`
--

DROP TABLE IF EXISTS `user_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_tokens` (
  `id` varchar(36) NOT NULL,
  `userId` varchar(36) NOT NULL,
  `tokenHash` varchar(255) NOT NULL,
  `family` varchar(36) NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expiresAt` timestamp NOT NULL,
  `isRevoked` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `user_idx` (`userId`),
  KEY `expires_idx` (`expiresAt`),
  KEY `family_idx` (`family`),
  CONSTRAINT `user_tokens_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_tokens`
--

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` char(26) NOT NULL,
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
  `avatar` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username_unique` (`username`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `robloxId` (`robloxId`),
  UNIQUE KEY `affiliateCode` (`affiliateCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('01JV4YB5Z6MHAZMA1B4582K6RN','verylongusername123123','123@protonmail.com',57643.11000000,9438024,4,'$2b$10$II57PFqgmZ8suqrgxyt/tucd4Bb12v7bLRCl5VRisQzwawCkd8hYG','PM6FIMCCGQSTOQDFMUXUQMCOHBEDKXJEOJHTSLC6KM4HO6L5HFAA',NULL,0,0,0,0,0,'OWNER',0,NULL,NULL,0,'::1',NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,'2025-05-13 13:46:29','2025-06-12 01:56:09',NULL,'test',0,0.00000000,1,'https://img.freepik.com/free-vector/cute-astronaut-playing-vr-game-with-controller-cartoon-vector-icon-illustration-science-technology_138676-13977.jpg?semt=ais_hybrid&w=740'),('01JVJVWQPC3403M4GXQCAHSWFG','BOT - RETARD',NULL,0.00000000,0,0,'$2b$10$VXeUGrbH.BO05hzRnfPY7O9W9M2.BELTgM2q3a/X5PlmN8vcwe5R2',NULL,NULL,0,0,0,0,0,'BOT',0,NULL,NULL,0,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,'2025-05-18 23:33:00','2025-05-18 23:33:00',NULL,NULL,0,0.00000000,1,NULL),('01JVJWQVHWYZPTC98A92VBCTJY','BOT - RETARD 2',NULL,0.00000000,0,0,'$2b$10$5/RHhACTxApSB5Qnz/hd0uUiSs8zibqjayU2MET8sRMqTTi8hK9Nu',NULL,NULL,0,0,0,0,0,'BOT',0,NULL,NULL,0,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,'2025-05-18 23:47:49','2025-05-18 23:47:49',NULL,NULL,0,0.00000000,1,NULL),('01JVJWR7JRVNXT243T3Y25QP4P','BOT - RETARD 3',NULL,0.00000000,0,0,'$2b$10$Za2OSRcK/DnXjHmIuM0qgO46xPH04fKg0f7DZSME776/u/X0rsyr2',NULL,NULL,0,0,0,0,0,'BOT',0,NULL,NULL,0,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,'2025-05-18 23:48:01','2025-05-18 23:48:01',NULL,NULL,0,0.00000000,1,NULL),('01JX5TNEM0RA789TS51N1NFCMJ','test','test@test.com',100625.00000000,12500,0,'$2b$10$qqjDry2pAP7/odRPhqrCQ.ZhniRqu9f6RSJINEt8aR09EjMTVbjjW',NULL,NULL,0,0,0,0,0,NULL,0,NULL,NULL,0,'::1',NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,'2025-06-07 18:32:49','2025-06-07 18:34:10',NULL,NULL,0,0.00000000,1,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'casino_5'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-13  0:38:07

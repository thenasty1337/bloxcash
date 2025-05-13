-- BloxClash Database Schema
-- Target: MySQL 8.0+

-- Core User Table
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) UNIQUE NULL,
    `balance` DECIMAL(20, 8) NOT NULL DEFAULT 0.00000000,
    `xp` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `perms` INT NOT NULL DEFAULT 0, -- Permission level (e.g., 0: user, 1: mod, 2: admin)
    `passwordHash` VARCHAR(255) NOT NULL,
    `robloxId` BIGINT UNSIGNED UNIQUE NULL,
    `accountLock` BOOLEAN NOT NULL DEFAULT FALSE,
    `sponsorLock` BOOLEAN NOT NULL DEFAULT FALSE,
    `banned` BOOLEAN NOT NULL DEFAULT FALSE, -- Added for explicit bans
    `leaderboardBan` BOOLEAN NOT NULL DEFAULT FALSE, -- Exclude user from leaderboards
    `verified` BOOLEAN NOT NULL DEFAULT FALSE, -- Email or other verification
    `role` VARCHAR(50), -- e.g., 'BOT', 'USER'
    `anon` BOOLEAN NOT NULL DEFAULT FALSE, -- For anonymous display in games
    `clientSeed` VARCHAR(255), -- User's client seed for provably fair systems
    `serverSeed` VARCHAR(255), -- Current active server seed for user
    `nonce` BIGINT UNSIGNED NOT NULL DEFAULT 0, -- Nonce for provably fair systems
    `ip` VARCHAR(45), -- Last known IP address
    `country` VARCHAR(255) NULL, -- User's country
    `mutedUntil` TIMESTAMP NULL, -- Timestamp when user's chat mute expires
    `tipBan` BOOLEAN NOT NULL DEFAULT FALSE, -- Prevent user from tipping
    `rainBan` BOOLEAN NOT NULL DEFAULT FALSE, -- Prevent user from joining/tipping rain
    `maxPerTip` DECIMAL(20, 8) NULL, -- Max amount user can send in a single tip
    `maxTipPerUser` DECIMAL(20, 8) NULL, -- Max amount user can send to a specific user (period?)
    `tipAllowance` DECIMAL(20, 8) NULL, -- Total tip allowance (period?)
    `rainTipAllowance` DECIMAL(20, 8) NULL, -- Total rain tip allowance (period?)
    `cryptoAllowance` DECIMAL(20, 8) NULL, -- Crypto withdrawal allowance (period?)
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `lastLogout` TIMESTAMP NULL, -- Timestamp of last logout
    `affiliateCode` VARCHAR(255) UNIQUE NULL, -- Unique code assigned to users for referrals
    `affiliateCodeLock` BOOLEAN NOT NULL DEFAULT FALSE, -- Prevent affiliate code changes
    `affiliateEarningsOffset` DECIMAL(20, 8) NOT NULL DEFAULT 0.00000000, -- Tracks earnings already paid out/accounted for
    `mentionsEnabled` BOOLEAN NOT NULL DEFAULT TRUE, -- Whether user can be mentioned in chat
    PRIMARY KEY (`id`),
    UNIQUE KEY `username_unique` (`username`)
);

-- Transactions Log
CREATE TABLE `transactions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `userId` BIGINT UNSIGNED NOT NULL,
    `amount` DECIMAL(20, 8) NOT NULL,
    `type` VARCHAR(50) NOT NULL, -- e.g., 'in', 'out', 'deposit', 'withdraw'
    `method` VARCHAR(50) NOT NULL, -- e.g., 'rain', 'promo', 'tip', 'robux', 'crypto', 'limiteds', 'survey-chargeback', 'deposit-bonus', 'adurite'
    `methodId` BIGINT UNSIGNED, -- ID of the related entity (e.g., rainId, promoCodeUsesId, surveyId)
    `methodDisplay` VARCHAR(255), -- Optional display name for the method
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `userId_idx` (`userId`),
    KEY `type_method_idx` (`type`, `method`),
    CONSTRAINT `fk_transactions_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

-- Rains
CREATE TABLE `rains` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `host` BIGINT UNSIGNED, -- Null for system rains
    `amount` DECIMAL(20, 8) NOT NULL,
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `endedAt` TIMESTAMP NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_rains_host` FOREIGN KEY (`host`) REFERENCES `users` (`id`) ON DELETE SET NULL
);

CREATE TABLE `rainUsers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `rainId` BIGINT UNSIGNED NOT NULL,
    `userId` BIGINT UNSIGNED NOT NULL,
    `amount` DECIMAL(20, 8), -- Amount received by this user from this rain
    `joinedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `rainId_userId_unique` (`rainId`, `userId`),
    CONSTRAINT `fk_rainUsers_rainId` FOREIGN KEY (`rainId`) REFERENCES `rains` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_rainUsers_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

-- Chat Messages
CREATE TABLE `chatMessages` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `senderId` BIGINT UNSIGNED, -- Null for system messages
    `channelId` VARCHAR(50) DEFAULT NULL, -- e.g., 'global', 'VIP', or NULL for system/direct messages
    `type` VARCHAR(50) NOT NULL, -- e.g., 'user', 'system', 'rain-end'
    `content` TEXT NOT NULL, -- Can be JSON for structured messages
    `replyTo` BIGINT UNSIGNED, -- messageId this is a reply to
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deletedAt` TIMESTAMP NULL, -- For soft deletion
    PRIMARY KEY (`id`),
    KEY `channelId_deletedAt_idx` (`channelId`, `deletedAt`), -- Index for fetching channel messages
    CONSTRAINT `fk_chatMessages_senderId` FOREIGN KEY (`senderId`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_chatMessages_replyTo` FOREIGN KEY (`replyTo`) REFERENCES `chatMessages` (`id`) ON DELETE SET NULL
);

-- Surveys
CREATE TABLE `surveys` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `userId` BIGINT UNSIGNED NOT NULL,
    `provider` VARCHAR(50) NOT NULL, -- e.g., 'lootably', 'cpx'
    `transactionId` VARCHAR(255) NOT NULL, -- Provider's transaction ID
    `robux` DECIMAL(20, 8) NOT NULL,
    `revenue` DECIMAL(20, 8),
    `ip` VARCHAR(45),
    `status` VARCHAR(50), -- Status from provider
    `hash` VARCHAR(255), -- Postback hash
    `chargedbackAt` TIMESTAMP NULL,
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `provider_transactionId_unique` (`provider`, `transactionId`),
    CONSTRAINT `fk_surveys_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

-- Adurite (External Item Trading)
CREATE TABLE `adurite` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `aduriteId` VARCHAR(255) NOT NULL, -- ID from Adurite system
    `userId` BIGINT UNSIGNED NOT NULL,
    `robuxAmount` DECIMAL(20, 8) NOT NULL,
    `fiatAmount` DECIMAL(20, 8),
    `status` VARCHAR(50) NOT NULL, -- e.g., 'pending', 'reserved', 'failed', 'completed'
    `reservationId` VARCHAR(255),
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_adurite_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

-- Marketplace (User-to-User Limiteds Trading)
CREATE TABLE `marketplaceListings` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `sellerId` BIGINT UNSIGNED NOT NULL,
    `buyerId` BIGINT UNSIGNED,
    `robloxTradeId` VARCHAR(255),
    `status` VARCHAR(50) NOT NULL DEFAULT 'active', -- e.g., 'active', 'completed', 'cancelled'
    `price` DECIMAL(20, 8) NOT NULL, -- Total price of all items in listing
    `boughtPrice` DECIMAL(20, 8), -- Actual price it was bought for
    `buyerItem` JSON, -- Details of the item the buyer offered/traded, if applicable
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_marketplaceListings_sellerId` FOREIGN KEY (`sellerId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_marketplaceListings_buyerId` FOREIGN KEY (`buyerId`) REFERENCES `users` (`id`) ON DELETE SET NULL
);

CREATE TABLE `marketplaceListingItems` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `marketplaceListingId` BIGINT UNSIGNED NOT NULL,
    `userAssetId` VARCHAR(255) NOT NULL, -- Roblox UserAssetID
    `assetId` VARCHAR(255) NOT NULL, -- Roblox AssetID
    `price` DECIMAL(20, 8) NOT NULL, -- Price of this specific item in the listing
    `discount` DECIMAL(5,2) DEFAULT 0.00, -- Discount percentage applied
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_mpli_listingId` FOREIGN KEY (`marketplaceListingId`) REFERENCES `marketplaceListings` (`id`) ON DELETE CASCADE
);

-- Robux Exchange (Deposits/Withdrawals via Game Passes)
CREATE TABLE `robuxExchanges` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `userId` BIGINT UNSIGNED NOT NULL,
    `operation` VARCHAR(50) NOT NULL, -- 'deposit' or 'withdraw'
    `totalAmount` DECIMAL(20, 2) NOT NULL, -- Robux amount
    `filledAmount` DECIMAL(20, 2) NOT NULL DEFAULT 0.00,
    `status` VARCHAR(50) NOT NULL DEFAULT 'pending', -- e.g., 'pending', 'complete', 'failed'
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_robuxExchanges_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

CREATE TABLE `gamePassTxs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `assetId` VARCHAR(255), -- Roblox asset ID of the game pass
    `depositId` BIGINT UNSIGNED,
    `withdrawId` BIGINT UNSIGNED,
    `amount` DECIMAL(20, 2) NOT NULL,
    `universeId` VARCHAR(255),
    `gamePassId` VARCHAR(255),
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_gpTxs_depositId` FOREIGN KEY (`depositId`) REFERENCES `robuxExchanges` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_gpTxs_withdrawId` FOREIGN KEY (`withdrawId`) REFERENCES `robuxExchanges` (`id`) ON DELETE SET NULL
);

-- Provably Fair Rolls (General)
CREATE TABLE `fairRolls` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `serverSeed` VARCHAR(255) NOT NULL,
    `clientSeed` VARCHAR(255) NOT NULL,
    `nonce` BIGINT UNSIGNED NOT NULL,
    `seed` VARCHAR(255), -- Potentially combined seed or specific game seed
    `result` TEXT NOT NULL, -- Can be JSON or specific result format
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
);

-- Game: Cases (General Definitions)
CREATE TABLE `cases` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL, -- URL friendly name
    `img` VARCHAR(255), -- Case image URL
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `slug_unique` (`slug`)
);

-- Game: Case Versions (Modified)
CREATE TABLE `caseVersions` ( -- A specific version/revision of a case, items can change
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `caseId` BIGINT UNSIGNED NOT NULL, -- FK to cases.id
    `name` VARCHAR(255) NOT NULL, -- e.g. "Cool Case v1"
    `price` DECIMAL(20, 8) NOT NULL,
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `endedAt` TIMESTAMP NULL, -- Marks when this version became inactive
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_caseVersions_caseId` FOREIGN KEY (`caseId`) REFERENCES `cases` (`id`) ON DELETE CASCADE
);

-- Game: Case Items
CREATE TABLE `caseItems` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `caseVersionId` BIGINT UNSIGNED NOT NULL,
    `robloxId` VARCHAR(255), -- Roblox Asset ID
    `name` VARCHAR(255) NOT NULL,
    `img` VARCHAR(255),
    `price` DECIMAL(20, 8) NOT NULL, -- Market value of the item
    `rangeFrom` DECIMAL(10, 4) NOT NULL, -- For weighted probability
    `rangeTo` DECIMAL(10, 4) NOT NULL, -- For weighted probability
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_caseItems_caseVersionId` FOREIGN KEY (`caseVersionId`) REFERENCES `caseVersions` (`id`) ON DELETE CASCADE
);

CREATE TABLE `caseOpenings` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `userId` BIGINT UNSIGNED NOT NULL,
    `caseVersionId` BIGINT UNSIGNED NOT NULL,
    `rollId` BIGINT UNSIGNED NOT NULL, -- FK to fairRolls
    `caseItemId` BIGINT UNSIGNED NOT NULL, -- The item won
    `cost` DECIMAL(20, 8) NOT NULL, -- Cost of opening this case
    `winnings` DECIMAL(20, 8) NOT NULL, -- Value of item won
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_caseOpenings_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_caseOpenings_caseVersionId` FOREIGN KEY (`caseVersionId`) REFERENCES `caseVersions` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_caseOpenings_rollId` FOREIGN KEY (`rollId`) REFERENCES `fairRolls` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_caseOpenings_caseItemId` FOREIGN KEY (`caseItemId`) REFERENCES `caseItems` (`id`) ON DELETE CASCADE
);

-- Game: Battles
CREATE TABLE `battles` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `round` INT NOT NULL DEFAULT 0,
    `status` VARCHAR(50) NOT NULL DEFAULT 'pending', -- e.g., 'pending', 'active', 'completed', 'error'
    `serverSeed` VARCHAR(255) NOT NULL,
    `clientSeed` VARCHAR(255),
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `startedAt` TIMESTAMP NULL,
    `endedAt` TIMESTAMP NULL,
    PRIMARY KEY (`id`)
);

CREATE TABLE `battlePlayers` ( -- Users participating in a battle
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `battleId` BIGINT UNSIGNED NOT NULL,
    `userId` BIGINT UNSIGNED NOT NULL,
    `team` VARCHAR(50), -- If team-based battles
    PRIMARY KEY (`id`),
    UNIQUE KEY `battleId_userId_unique` (`battleId`, `userId`),
    CONSTRAINT `fk_battlePlayers_battleId` FOREIGN KEY (`battleId`) REFERENCES `battles` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_battlePlayers_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

CREATE TABLE `battleOpenings` ( -- Links case openings to battles
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `battleId` BIGINT UNSIGNED NOT NULL,
    `caseOpeningId` BIGINT UNSIGNED NOT NULL,
    `round` INT NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_battleOpenings_battleId` FOREIGN KEY (`battleId`) REFERENCES `battles` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_battleOpenings_caseOpeningId` FOREIGN KEY (`caseOpeningId`) REFERENCES `caseOpenings` (`id`) ON DELETE CASCADE
);

-- Game: Coinflip
CREATE TABLE `coinflips` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `ownerId` BIGINT UNSIGNED NOT NULL, -- User who created the coinflip
    `fire` BIGINT UNSIGNED, -- userId of player on fire side
    `ice` BIGINT UNSIGNED, -- userId of player on ice side
    `amount` DECIMAL(20, 8) NOT NULL,
    `serverSeed` VARCHAR(255) NOT NULL,
    `clientSeed` VARCHAR(255),
    `EOSBlock` BIGINT, -- EOS block number for commit
    `winnerSide` VARCHAR(10), -- 'fire' or 'ice'
    `status` VARCHAR(50) NOT NULL DEFAULT 'pending', -- e.g. 'pending', 'active', 'completed'
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `startedAt` TIMESTAMP NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_coinflips_ownerId` FOREIGN KEY (`ownerId`) REFERENCES `users` (`id`) ON DELETE CASCADE, -- Added FK for ownerId
    CONSTRAINT `fk_coinflips_fire` FOREIGN KEY (`fire`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_coinflips_ice` FOREIGN KEY (`ice`) REFERENCES `users` (`id`) ON DELETE SET NULL
);

-- Table for Rain Tips (Contributions)
CREATE TABLE `rainTips` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `userId` BIGINT UNSIGNED NOT NULL, -- User who tipped
    `rainId` BIGINT UNSIGNED NOT NULL, -- Rain the tip was for
    `amount` DECIMAL(20, 8) NOT NULL, -- Amount tipped
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `rainId_userId_idx` (`rainId`, `userId`), -- Index for the query causing the error
    CONSTRAINT `fk_rainTips_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_rainTips_rainId` FOREIGN KEY (`rainId`) REFERENCES `rains` (`id`) ON DELETE CASCADE
);

-- General Bets Log (for various games)
CREATE TABLE `bets` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `userId` BIGINT UNSIGNED NOT NULL,
    `game` VARCHAR(50) NOT NULL, -- e.g., 'coinflip', 'roulette', 'slots', 'battles'
    `gameId` BIGINT UNSIGNED NOT NULL, -- ID of the specific game instance (e.g., coinflipId, rouletteRoundId)
    `amount` DECIMAL(20, 8) NOT NULL, -- Bet amount
    `winnings` DECIMAL(20, 8) DEFAULT 0.00000000,
    `edge` DECIMAL(20, 8) DEFAULT 0.00000000, -- House edge on this bet
    `payout` DECIMAL(20,8) DEFAULT 0.00000000, -- Actual payout including stake if won
    `choice` VARCHAR(255), -- User's bet choice (e.g. 'red' in roulette, side in coinflip)
    `completed` BOOLEAN NOT NULL DEFAULT FALSE,
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `userId_game_idx` (`userId`, `game`),
    CONSTRAINT `fk_bets_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

-- Crypto Deposits
CREATE TABLE `cryptoWallets` ( -- User's deposit wallets
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `userId` BIGINT UNSIGNED NOT NULL,
    `currency` VARCHAR(10) NOT NULL, -- e.g., 'BTC', 'ETH', 'LTC'
    `address` VARCHAR(255) NOT NULL,
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `userId_currency_address_unique` (`userId`, `currency`, `address`), -- Or just address if globally unique
    CONSTRAINT `fk_cryptoWallets_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

CREATE TABLE `cryptoDeposits` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `userId` BIGINT UNSIGNED NOT NULL,
    `currency` VARCHAR(10) NOT NULL,
    `cryptoAmount` DECIMAL(36, 18) NOT NULL, -- High precision for crypto
    `fiatAmount` DECIMAL(20, 2), -- USD or other fiat equivalent at time of deposit
    `robuxAmount` DECIMAL(20, 8), -- Robux equivalent credited
    `txId` VARCHAR(255) NOT NULL, -- Blockchain transaction ID
    `status` VARCHAR(50) NOT NULL, -- e.g., 'pending', 'completed', 'failed'
    `confirmations` INT DEFAULT 0,
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `txId_currency_unique` (`txId`, `currency`),
    CONSTRAINT `fk_cryptoDeposits_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

-- Crypto Withdrawals
CREATE TABLE `cryptoWithdraws` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `userId` BIGINT UNSIGNED NOT NULL,
    `currency` VARCHAR(10) NOT NULL,
    `chain` VARCHAR(50), -- e.g. 'ERC20', 'TRC20', 'BTC'
    `address` VARCHAR(255) NOT NULL,
    `robuxAmount` DECIMAL(20, 8) NOT NULL, -- Robux debited
    `fiatAmount` DECIMAL(20, 2), -- Fiat equivalent
    `cryptoAmount` DECIMAL(36, 18), -- Crypto amount to be sent
    `exchangeId` VARCHAR(255), -- Withdrawal ID from the exchange (e.g., MEXC)
    `txId` VARCHAR(255), -- Blockchain transaction ID once sent
    `status` VARCHAR(50) NOT NULL DEFAULT 'pending', -- e.g., 'pending', 'sending', 'sent', 'completed', 'failed', 'admin_review'
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `modifiedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Added column
    PRIMARY KEY (`id`),
    KEY `status_idx` (`status`), -- Add index for status lookups
    KEY `exchangeId_idx` (`exchangeId`), -- Add index for exchangeId lookups
    CONSTRAINT `fk_cryptoWithdraws_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

-- Discord Integration / Earn System
CREATE TABLE `discordAuths` ( -- Linking Discord accounts to platform accounts
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `userId` BIGINT UNSIGNED NOT NULL,
    `discordId` VARCHAR(255) NOT NULL,
    `discordUsername` VARCHAR(255),
    `discordAvatar` VARCHAR(255),
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `userId_unique` (`userId`),
    UNIQUE KEY `discordId_unique` (`discordId`),
    CONSTRAINT `fk_discordAuths_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

CREATE TABLE `earnUsers` ( -- Users in the earn system, identified by Discord ID
    `id` VARCHAR(255) NOT NULL, -- Discord User ID
    `unclaimed` DECIMAL(20, 8) NOT NULL DEFAULT 0.00000000,
    `elegible` BOOLEAN NOT NULL DEFAULT FALSE, -- Typo from code: 'elegible' -> consider correcting to 'eligible'
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
);

CREATE TABLE `earnClaims` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `earnUserId` VARCHAR(255) NOT NULL, -- Discord User ID (FK to earnUsers.id)
    `amount` DECIMAL(20, 8) NOT NULL,
    `claimedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_earnClaims_earnUserId` FOREIGN KEY (`earnUserId`) REFERENCES `earnUsers` (`id`) ON DELETE CASCADE
);

-- Promo Codes
CREATE TABLE `promoCodes` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(255) NOT NULL,
    `amount` DECIMAL(20, 8) NOT NULL,
    `totalUses` INT, -- Nullable for infinite uses
    `currentUses` INT NOT NULL DEFAULT 0,
    `minLvl` INT DEFAULT 0, -- Minimum user level to use
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `expiresAt` TIMESTAMP NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `code_unique` (`code`)
);

CREATE TABLE `promoCodeUses` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `userId` BIGINT UNSIGNED NOT NULL,
    `promoCodeId` BIGINT UNSIGNED NOT NULL,
    `usedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `userId_promoCodeId_unique` (`userId`, `promoCodeId`),
    CONSTRAINT `fk_promoCodeUses_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_promoCodeUses_promoCodeId` FOREIGN KEY (`promoCodeId`) REFERENCES `promoCodes` (`id`) ON DELETE CASCADE
);

-- Game: Slots (Hacksaw provider example)
CREATE TABLE `slots` ( -- General slot machine definitions
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `provider` VARCHAR(50) NOT NULL, -- e.g., 'hacksaw', 'pragmatic'
    `providerGameId` VARCHAR(255) NOT NULL, -- Game ID from the provider
    `name` VARCHAR(255) NOT NULL,
    `rtp` DECIMAL(5, 2), -- Return To Player percentage
    `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `provider_gameId_unique` (`provider`, `providerGameId`)
);

CREATE TABLE `hacksawSessions` ( -- User sessions for Hacksaw slots
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `userId` BIGINT UNSIGNED NOT NULL,
    `sessionId` VARCHAR(255) NOT NULL, -- Session ID from Hacksaw
    `gameId` VARCHAR(255) NOT NULL, -- Provider's game ID (references slots.providerGameId)
    `balance` DECIMAL(20, 8) NOT NULL, -- Session balance in provider's currency (e.g. cents)
    `currency` VARCHAR(10) NOT NULL DEFAULT 'EUR', -- Or whatever Hacksaw uses
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `sessionId_unique` (`sessionId`),
    CONSTRAINT `fk_hacksawSessions_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
    -- Potentially a FK to slots table on (provider='hacksaw', providerGameId=gameId)
);

-- Game: Roulette
CREATE TABLE `roulette` ( -- Stores each round of roulette
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `serverSeed` VARCHAR(255) NOT NULL,
    `clientSeed` VARCHAR(255), -- Revealed after roll
    `publicSeed` VARCHAR(255), -- Seed revealed before betting
    `result` INT, -- Number result (0-14 or similar)
    `color` VARCHAR(10), -- 'red', 'black', 'green'
    `status` VARCHAR(50) NOT NULL DEFAULT 'betting', -- e.g. 'betting', 'rolling', 'completed'
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `rolledAt` TIMESTAMP NULL,
    `endedAt` TIMESTAMP NULL,
    PRIMARY KEY (`id`)
);

-- Notifications
CREATE TABLE `notifications` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `userId` BIGINT UNSIGNED NOT NULL,
    `type` VARCHAR(100) NOT NULL, -- e.g., 'deposit-completed', 'withdraw-completed', 'tip-received'
    `data` JSON, -- Content of the notification
    `isRead` BOOLEAN NOT NULL DEFAULT FALSE,
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_notifications_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

-- User Seeds (for provably fair system)
CREATE TABLE `userSeeds` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `userId` BIGINT UNSIGNED NOT NULL,
    `serverSeed` VARCHAR(255) NOT NULL,
    `clientSeed` VARCHAR(255) NOT NULL,
    `hashedServerSeed` VARCHAR(255), -- If you store hashed version publicly
    `isActive` BOOLEAN NOT NULL DEFAULT FALSE, -- If this is the current active seed pair
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    -- Partial unique index constraint (MySQL 8.0.13+)
    UNIQUE KEY `user_active_seed_unique` (`userId`, `isActive`) WHERE (`isActive` IS TRUE),
    -- Keep a regular index on userId for lookups
    KEY `userId_idx` (`userId`),
    CONSTRAINT `fk_userSeeds_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

-- Game: Crash Rounds
CREATE TABLE `crash` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `serverSeed` VARCHAR(255) NOT NULL,
    `publicSeed` VARCHAR(255), -- Seed shown before round starts (if used)
    `crashPoint` DECIMAL(10, 2), -- Multiplier where it crashed, NULL until ended
    `status` VARCHAR(50) NOT NULL DEFAULT 'pending', -- e.g., 'pending', 'betting', 'running', 'completed'
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `startedAt` TIMESTAMP NULL,
    `endedAt` TIMESTAMP NULL,
    PRIMARY KEY (`id`)
);

CREATE TABLE `ipBlacklist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ipAddress` varchar(45) NOT NULL,
	`ipRange` varchar(100),
	`reason` enum('brute_force_attack','credential_stuffing','account_takeover_attempt','ddos_attack','malware_distribution','spam','manual_block','other') NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`blockType` enum('temporary','permanent') NOT NULL DEFAULT 'temporary',
	`blockedUntil` timestamp,
	`addedBy` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ipBlacklist_id` PRIMARY KEY(`id`),
	CONSTRAINT `ipBlacklist_ipAddress_unique` UNIQUE(`ipAddress`)
);
--> statement-breakpoint
CREATE TABLE `ipRateLimitLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ipAddress` varchar(45) NOT NULL,
	`endpoint` varchar(255) NOT NULL,
	`requestCount` int NOT NULL DEFAULT 1,
	`violationType` enum('otp_verification','otp_request','login_attempt','password_reset','account_unlock_request') NOT NULL,
	`isBlocked` enum('true','false') NOT NULL DEFAULT 'false',
	`blockedUntil` timestamp,
	`userAgent` text,
	`firstRequestAt` timestamp NOT NULL DEFAULT (now()),
	`lastRequestAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ipRateLimitLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ipReputation` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ipAddress` varchar(45) NOT NULL,
	`reputationScore` int NOT NULL DEFAULT 0,
	`failedLoginAttempts` int NOT NULL DEFAULT 0,
	`successfulLogins` int NOT NULL DEFAULT 0,
	`suspiciousActivityCount` int NOT NULL DEFAULT 0,
	`lastSuspiciousActivity` timestamp,
	`countries` text,
	`devices` text,
	`isHighRisk` enum('true','false') NOT NULL DEFAULT 'false',
	`lastCheckedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ipReputation_id` PRIMARY KEY(`id`),
	CONSTRAINT `ipReputation_ipAddress_unique` UNIQUE(`ipAddress`)
);
--> statement-breakpoint
CREATE TABLE `ipWhitelist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ipAddress` varchar(45) NOT NULL,
	`ipRange` varchar(100),
	`description` varchar(255),
	`reason` enum('corporate_network','partner_integration','internal_testing','api_partner','other') NOT NULL,
	`addedBy` int,
	`expiresAt` timestamp,
	`isActive` enum('true','false') NOT NULL DEFAULT 'true',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ipWhitelist_id` PRIMARY KEY(`id`),
	CONSTRAINT `ipWhitelist_ipAddress_unique` UNIQUE(`ipAddress`)
);

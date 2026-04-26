CREATE TABLE `ipLoginSwitches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ipAddress` varchar(45) NOT NULL,
	`phoneUserId` int NOT NULL,
	`previousPhoneUserId` int,
	`switchCount` int NOT NULL DEFAULT 1,
	`isBlocked` enum('true','false') NOT NULL DEFAULT 'false',
	`blockedUntil` timestamp,
	`blockReason` varchar(255),
	`windowStartAt` timestamp NOT NULL DEFAULT (now()),
	`windowEndAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ipLoginSwitches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessionTokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phoneUserId` int NOT NULL,
	`token` varchar(255) NOT NULL,
	`tokenHash` varchar(255) NOT NULL,
	`ipAddress` varchar(45) NOT NULL,
	`userAgent` text,
	`deviceFingerprint` varchar(255),
	`isActive` enum('true','false') NOT NULL DEFAULT 'true',
	`isRevoked` enum('true','false') NOT NULL DEFAULT 'false',
	`revokedAt` timestamp,
	`revokedReason` varchar(255),
	`expiresAt` timestamp NOT NULL,
	`lastActivityAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sessionTokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `sessionTokens_token_unique` UNIQUE(`token`),
	CONSTRAINT `sessionTokens_tokenHash_unique` UNIQUE(`tokenHash`)
);
--> statement-breakpoint
CREATE TABLE `totpAttempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phoneUserId` int NOT NULL,
	`code` varchar(6) NOT NULL,
	`isValid` enum('true','false') NOT NULL,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `totpAttempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `totpSecrets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phoneUserId` int NOT NULL,
	`secret` varchar(255) NOT NULL,
	`backupCodes` text NOT NULL,
	`isEnabled` enum('true','false') NOT NULL DEFAULT 'false',
	`enabledAt` timestamp,
	`disabledAt` timestamp,
	`lastUsedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `totpSecrets_id` PRIMARY KEY(`id`)
);

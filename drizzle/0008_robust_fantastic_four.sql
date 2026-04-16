CREATE TABLE `deviceVerificationTokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phoneUserId` int NOT NULL,
	`token` varchar(255) NOT NULL,
	`deviceFingerprint` varchar(255) NOT NULL,
	`deviceName` varchar(255) NOT NULL,
	`userAgent` text,
	`ipAddress` varchar(45),
	`expiresAt` timestamp NOT NULL,
	`verified` enum('true','false') NOT NULL DEFAULT 'false',
	`verifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `deviceVerificationTokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `deviceVerificationTokens_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `trustedDevices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phoneUserId` int NOT NULL,
	`deviceFingerprint` varchar(255) NOT NULL,
	`deviceName` varchar(255) NOT NULL,
	`deviceToken` varchar(255) NOT NULL,
	`userAgent` text,
	`ipAddress` varchar(45),
	`lastUsedAt` timestamp NOT NULL DEFAULT (now()),
	`isActive` enum('true','false') NOT NULL DEFAULT 'true',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trustedDevices_id` PRIMARY KEY(`id`),
	CONSTRAINT `trustedDevices_deviceToken_unique` UNIQUE(`deviceToken`)
);

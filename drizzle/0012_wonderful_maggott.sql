CREATE TABLE `accountLinkTokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`accountLinkId` int NOT NULL,
	`token` varchar(255) NOT NULL,
	`tokenType` enum('email_verification','sms_verification') NOT NULL,
	`verificationCode` varchar(6),
	`expiresAt` timestamp NOT NULL,
	`verifiedAt` timestamp,
	`attempts` int NOT NULL DEFAULT 0,
	`maxAttempts` int NOT NULL DEFAULT 3,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `accountLinkTokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `accountLinkTokens_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `accountLinks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`phoneUserId` int,
	`linkMethod` enum('oauth_to_phone','oauth_to_email') NOT NULL,
	`verificationToken` varchar(255),
	`verificationTokenExpiresAt` timestamp,
	`isVerified` enum('true','false') NOT NULL DEFAULT 'false',
	`verifiedAt` timestamp,
	`isPrimary` enum('true','false') NOT NULL DEFAULT 'false',
	`status` enum('pending','active','revoked') NOT NULL DEFAULT 'pending',
	`revokedAt` timestamp,
	`revokedReason` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `accountLinks_id` PRIMARY KEY(`id`),
	CONSTRAINT `accountLinks_verificationToken_unique` UNIQUE(`verificationToken`)
);

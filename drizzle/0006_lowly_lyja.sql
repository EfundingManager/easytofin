CREATE TABLE `emailVerificationTokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phoneUserId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`token` varchar(255) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`verifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emailVerificationTokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `emailVerificationTokens_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
ALTER TABLE `phoneUsers` ADD `emailVerified` enum('true','false') DEFAULT 'false' NOT NULL;
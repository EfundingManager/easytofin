CREATE TABLE `smsVerificationTokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phoneUserId` int NOT NULL,
	`phone` varchar(20) NOT NULL,
	`otp` varchar(6) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`verifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `smsVerificationTokens_id` PRIMARY KEY(`id`)
);

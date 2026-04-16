CREATE TABLE `passwordResetTokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phoneUserId` int NOT NULL,
	`token` varchar(255) NOT NULL,
	`resetMethod` enum('email','phone') NOT NULL,
	`email` varchar(320),
	`phone` varchar(20),
	`otp` varchar(6) NOT NULL,
	`otpAttempts` int NOT NULL DEFAULT 0,
	`maxOtpAttempts` int NOT NULL DEFAULT 3,
	`otpVerified` enum('true','false') NOT NULL DEFAULT 'false',
	`otpVerifiedAt` timestamp,
	`passwordResetAt` timestamp,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `passwordResetTokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `passwordResetTokens_token_unique` UNIQUE(`token`)
);

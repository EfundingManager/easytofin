CREATE TABLE `accountLockouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phoneUserId` int,
	`email` varchar(320),
	`phone` varchar(20),
	`failedAttempts` int NOT NULL DEFAULT 0,
	`maxFailedAttempts` int NOT NULL DEFAULT 5,
	`isLocked` enum('true','false') NOT NULL DEFAULT 'false',
	`lockedUntil` timestamp,
	`lastFailedAttempt` timestamp,
	`lastFailureReason` varchar(255),
	`unlockMethod` enum('time_based','email_verification','sms_verification') DEFAULT 'time_based',
	`unlockToken` varchar(255),
	`unlockTokenExpiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `accountLockouts_id` PRIMARY KEY(`id`),
	CONSTRAINT `accountLockouts_unlockToken_unique` UNIQUE(`unlockToken`)
);

CREATE TABLE `rateLimitLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`identifier` varchar(320) NOT NULL,
	`identifierType` enum('phone','email') NOT NULL,
	`violationType` enum('send_otp','verify_otp') NOT NULL,
	`attemptCount` int NOT NULL DEFAULT 1,
	`ipAddress` varchar(45),
	`userAgent` text,
	`isWhitelisted` enum('true','false') NOT NULL DEFAULT 'false',
	`resolvedAt` timestamp,
	`resolvedBy` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rateLimitLogs_id` PRIMARY KEY(`id`)
);

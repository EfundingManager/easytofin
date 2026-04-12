CREATE TABLE `featureFlags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`flagName` varchar(100) NOT NULL,
	`description` text,
	`enabled` enum('true','false') NOT NULL DEFAULT 'false',
	`targetAudience` varchar(100) DEFAULT 'all',
	`rolloutPercentage` int DEFAULT 100,
	`metadata` text,
	`changedBy` int,
	`changeReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `featureFlags_id` PRIMARY KEY(`id`),
	CONSTRAINT `featureFlags_flagName_unique` UNIQUE(`flagName`)
);

CREATE TABLE `sessionActivityLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phoneUserId` int,
	`userId` int,
	`email` varchar(320),
	`phone` varchar(20),
	`activityType` enum('login','logout','session_created','session_terminated') NOT NULL,
	`ipAddress` varchar(45),
	`userAgent` text,
	`sessionId` varchar(255),
	`deviceFingerprint` varchar(255),
	`location` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sessionActivityLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `suspiciousActivityLockout` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phoneUserId` int,
	`userId` int,
	`email` varchar(320),
	`phone` varchar(20),
	`lockoutReason` enum('excessive_login_logout','rapid_location_change','unusual_access_pattern','concurrent_sessions') NOT NULL,
	`activityCount` int NOT NULL DEFAULT 0,
	`timeWindowSeconds` int NOT NULL DEFAULT 120,
	`lockedAt` timestamp NOT NULL DEFAULT (now()),
	`unlocksAt` timestamp NOT NULL,
	`unlockReason` varchar(255),
	`unlockedAt` timestamp,
	`unlockedBy` varchar(255),
	`ipAddress` varchar(45),
	`userAgent` text,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `suspiciousActivityLockout_id` PRIMARY KEY(`id`)
);

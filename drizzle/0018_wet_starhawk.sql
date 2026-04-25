CREATE TABLE `accountLockouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phoneUserId` int,
	`email` varchar(320),
	`phone` varchar(20),
	`failedAttempts` int NOT NULL DEFAULT 0,
	`lockedUntil` timestamp NOT NULL,
	`lockReason` varchar(255) NOT NULL,
	`unlockedBy` varchar(64),
	`unlockedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `accountLockouts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `loginAttempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phoneUserId` int,
	`email` varchar(320),
	`phone` varchar(20),
	`attemptType` enum('otp','password','google') NOT NULL,
	`success` enum('true','false') NOT NULL,
	`ipAddress` varchar(45),
	`userAgent` text,
	`failureReason` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `loginAttempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `securityAuditLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phoneUserId` int,
	`email` varchar(320),
	`phone` varchar(20),
	`eventType` enum('login_success','login_failed','account_locked','account_unlocked','password_changed','password_reset','2fa_enabled','2fa_disabled','device_added','device_removed','session_terminated','suspicious_activity') NOT NULL,
	`description` text,
	`ipAddress` varchar(45),
	`userAgent` text,
	`severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'low',
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `securityAuditLog_id` PRIMARY KEY(`id`)
);

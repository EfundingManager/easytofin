CREATE TABLE `firstLoginTracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phoneUserId` int NOT NULL,
	`hasCompletedFirstLogin` enum('true','false') NOT NULL DEFAULT 'false',
	`requiresTOTP2FA` enum('true','false') NOT NULL DEFAULT 'false',
	`totpSetupCompletedAt` timestamp,
	`firstLoginAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `firstLoginTracking_id` PRIMARY KEY(`id`),
	CONSTRAINT `firstLoginTracking_phoneUserId_unique` UNIQUE(`phoneUserId`)
);
--> statement-breakpoint
CREATE TABLE `totp2faAuditLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phoneUserId` int NOT NULL,
	`eventType` enum('setup_initiated','setup_completed','verification_success','verification_failed','backup_code_used','backup_code_failed','reset_initiated','reset_completed','disabled') NOT NULL,
	`code` varchar(6),
	`isValid` enum('true','false'),
	`ipAddress` varchar(45),
	`userAgent` text,
	`description` text,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `totp2faAuditLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userRoles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phoneUserId` int NOT NULL,
	`role` enum('super_admin','admin','manager','staff','support','user','customer') NOT NULL,
	`assignedBy` int,
	`assignedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userRoles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `firstLoginTracking` ADD CONSTRAINT `firstLoginTracking_phoneUserId_phoneUsers_id_fk` FOREIGN KEY (`phoneUserId`) REFERENCES `phoneUsers`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userRoles` ADD CONSTRAINT `userRoles_phoneUserId_phoneUsers_id_fk` FOREIGN KEY (`phoneUserId`) REFERENCES `phoneUsers`(`id`) ON DELETE cascade ON UPDATE no action;
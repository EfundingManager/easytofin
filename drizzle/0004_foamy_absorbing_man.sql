CREATE TABLE `emailBlastDeliveries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`blastId` int NOT NULL,
	`recipientId` int NOT NULL,
	`recipientEmail` varchar(320) NOT NULL,
	`status` enum('pending','sent','failed','bounced','opened','clicked') NOT NULL DEFAULT 'pending',
	`sentAt` timestamp,
	`failureReason` text,
	`openedAt` timestamp,
	`clickedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `emailBlastDeliveries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emailBlasts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateId` int NOT NULL,
	`campaignName` varchar(255) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`recipientFilter` text,
	`totalRecipients` int DEFAULT 0,
	`sentCount` int DEFAULT 0,
	`failedCount` int DEFAULT 0,
	`status` enum('draft','scheduled','sending','sent','failed','paused') NOT NULL DEFAULT 'draft',
	`scheduledAt` timestamp,
	`sentAt` timestamp,
	`createdBy` int,
	`updatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `emailBlasts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emailTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`htmlContent` text NOT NULL,
	`plainTextContent` text,
	`description` text,
	`category` enum('kyc','policy','renewal','welcome','notification','marketing','other') NOT NULL DEFAULT 'other',
	`isPredefined` enum('true','false') NOT NULL DEFAULT 'true',
	`isActive` enum('true','false') NOT NULL DEFAULT 'true',
	`variables` text,
	`createdBy` int,
	`updatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `emailTemplates_id` PRIMARY KEY(`id`),
	CONSTRAINT `emailTemplates_slug_unique` UNIQUE(`slug`)
);

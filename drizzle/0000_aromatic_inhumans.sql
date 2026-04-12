CREATE TABLE `clientDocuments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phoneUserId` int NOT NULL,
	`documentType` varchar(100) NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`mimeType` varchar(100),
	`fileSize` int,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	`status` enum('pending','verified','rejected') NOT NULL DEFAULT 'pending',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clientDocuments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
CREATE TABLE `factFindingForms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`phoneUserId` int,
	`policyNumber` varchar(100),
	`product` enum('protection','pensions','healthInsurance','generalInsurance','investments') NOT NULL,
	`formData` text,
	`status` enum('draft','submitted','reviewed','archived') NOT NULL DEFAULT 'draft',
	`submittedAt` timestamp,
	`policyAssignedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `factFindingForms_id` PRIMARY KEY(`id`),
	CONSTRAINT `factFindingForms_policyNumber_unique` UNIQUE(`policyNumber`)
);
--> statement-breakpoint
CREATE TABLE `otpCodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phoneUserId` int NOT NULL,
	`code` varchar(6) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`attempts` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `otpCodes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `phoneUsers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(36) NOT NULL,
	`customerId` varchar(36),
	`phone` varchar(20),
	`email` varchar(320),
	`name` text,
	`address` text,
	`passwordHash` text,
	`twoFactorEnabled` enum('true','false') NOT NULL DEFAULT 'false',
	`twoFactorSecret` text,
	`verified` enum('true','false') NOT NULL DEFAULT 'false',
	`emailVerified` enum('true','false') NOT NULL DEFAULT 'false',
	`role` enum('user','admin','manager','staff') NOT NULL DEFAULT 'user',
	`googleId` varchar(255),
	`picture` text,
	`loginMethod` varchar(64),
	`clientStatus` enum('queue','in_progress','assigned','customer') NOT NULL DEFAULT 'queue',
	`kycStatus` enum('pending','submitted','verified','rejected') NOT NULL DEFAULT 'pending',
	`kycSubmittedAt` timestamp,
	`kycVerifiedAt` timestamp,
	`kycRejectionReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp,
	CONSTRAINT `phoneUsers_id` PRIMARY KEY(`id`),
	CONSTRAINT `phoneUsers_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `phoneUsers_customerId_unique` UNIQUE(`customerId`),
	CONSTRAINT `phoneUsers_phone_unique` UNIQUE(`phone`)
);
--> statement-breakpoint
CREATE TABLE `policyAssignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phoneUserId` int NOT NULL,
	`policyNumber` varchar(100) NOT NULL,
	`product` enum('protection','pensions','healthInsurance','generalInsurance','investments') NOT NULL,
	`insurerName` varchar(255),
	`premiumAmount` varchar(50),
	`startDate` timestamp,
	`endDate` timestamp,
	`advisorName` varchar(255),
	`advisorPhone` varchar(20),
	`notes` text,
	`assignedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `policyAssignments_id` PRIMARY KEY(`id`),
	CONSTRAINT `policyAssignments_policyNumber_unique` UNIQUE(`policyNumber`)
);
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE `userProducts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`phoneUserId` int,
	`product` enum('protection','pensions','healthInsurance','generalInsurance','investments') NOT NULL,
	`selectedAt` timestamp NOT NULL DEFAULT (now()),
	`status` enum('selected','in_progress','completed','abandoned') NOT NULL DEFAULT 'selected',
	CONSTRAINT `userProducts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin','manager','staff') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
ALTER TABLE `clientDocuments` ADD CONSTRAINT `clientDocuments_phoneUserId_phoneUsers_id_fk` FOREIGN KEY (`phoneUserId`) REFERENCES `phoneUsers`(`id`) ON DELETE cascade ON UPDATE no action;
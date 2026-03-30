CREATE TABLE `factFindingForms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`phoneUserId` int,
	`product` enum('protection','pensions','healthInsurance','generalInsurance','investments') NOT NULL,
	`formData` text,
	`status` enum('draft','submitted','reviewed','archived') NOT NULL DEFAULT 'draft',
	`submittedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `factFindingForms_id` PRIMARY KEY(`id`)
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
	`phone` varchar(20) NOT NULL,
	`email` varchar(320),
	`name` text,
	`passwordHash` text,
	`twoFactorEnabled` enum('true','false') NOT NULL DEFAULT 'false',
	`twoFactorSecret` text,
	`verified` enum('true','false') NOT NULL DEFAULT 'false',
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp,
	CONSTRAINT `phoneUsers_id` PRIMARY KEY(`id`),
	CONSTRAINT `phoneUsers_phone_unique` UNIQUE(`phone`)
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

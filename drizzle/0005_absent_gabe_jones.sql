CREATE TABLE `policyAssignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phoneUserId` int NOT NULL,
	`policyNumber` varchar(100) NOT NULL,
	`product` enum('protection','pensions','healthInsurance','generalInsurance','investments') NOT NULL,
	`insurerName` varchar(255),
	`premiumAmount` varchar(50),
	`startDate` timestamp,
	`endDate` timestamp,
	`notes` text,
	`assignedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `policyAssignments_id` PRIMARY KEY(`id`),
	CONSTRAINT `policyAssignments_policyNumber_unique` UNIQUE(`policyNumber`)
);
--> statement-breakpoint
ALTER TABLE `factFindingForms` ADD `policyAssignedAt` timestamp;--> statement-breakpoint
ALTER TABLE `phoneUsers` ADD `clientStatus` enum('queue','in_progress','assigned','customer') DEFAULT 'queue' NOT NULL;
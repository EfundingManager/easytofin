CREATE TABLE `recipientLists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`recipientCount` int DEFAULT 0,
	`createdBy` int NOT NULL,
	`updatedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `recipientLists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recipients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`listId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(255),
	`firstName` varchar(255),
	`lastName` varchar(255),
	`phone` varchar(20),
	`company` varchar(255),
	`status` enum('active','inactive','bounced','unsubscribed') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `recipients_id` PRIMARY KEY(`id`)
);

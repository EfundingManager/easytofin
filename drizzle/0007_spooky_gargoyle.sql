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
ALTER TABLE `clientDocuments` ADD CONSTRAINT `clientDocuments_phoneUserId_phoneUsers_id_fk` FOREIGN KEY (`phoneUserId`) REFERENCES `phoneUsers`(`id`) ON DELETE cascade ON UPDATE no action;
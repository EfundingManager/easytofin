ALTER TABLE `phoneUsers` ADD `isDeleted` enum('true','false') DEFAULT 'false' NOT NULL;--> statement-breakpoint
ALTER TABLE `phoneUsers` ADD `deletedAt` timestamp;--> statement-breakpoint
ALTER TABLE `phoneUsers` ADD `deletedBy` int;--> statement-breakpoint
ALTER TABLE `phoneUsers` ADD `deletionReason` text;
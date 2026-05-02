ALTER TABLE `phoneUsers` MODIFY COLUMN `isDeleted` boolean NOT NULL;--> statement-breakpoint
ALTER TABLE `phoneUsers` MODIFY COLUMN `isDeleted` boolean NOT NULL DEFAULT false;
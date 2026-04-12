ALTER TABLE `phoneUsers` DROP INDEX `phoneUsers_userId_unique`;--> statement-breakpoint
ALTER TABLE `phoneUsers` DROP INDEX `phoneUsers_customerId_unique`;--> statement-breakpoint
ALTER TABLE `phoneUsers` DROP COLUMN `userId`;--> statement-breakpoint
ALTER TABLE `phoneUsers` DROP COLUMN `customerId`;
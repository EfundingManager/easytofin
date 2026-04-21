DROP TABLE `accountLinkTokens`;--> statement-breakpoint
DROP TABLE `accountLinks`;--> statement-breakpoint
DROP TABLE `accountLockouts`;--> statement-breakpoint
DROP TABLE `loginAttempts`;--> statement-breakpoint
DROP TABLE `rolePermissions`;--> statement-breakpoint
DROP TABLE `smsVerificationTokens`;--> statement-breakpoint
ALTER TABLE `phoneUsers` MODIFY COLUMN `role` enum('user','admin','manager','staff','super_admin') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','manager','staff','super_admin') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `phoneUsers` DROP COLUMN `isDeleted`;--> statement-breakpoint
ALTER TABLE `phoneUsers` DROP COLUMN `deletedAt`;--> statement-breakpoint
ALTER TABLE `phoneUsers` DROP COLUMN `deletedBy`;--> statement-breakpoint
ALTER TABLE `phoneUsers` DROP COLUMN `deletionReason`;
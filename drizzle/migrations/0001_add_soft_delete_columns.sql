-- Add soft-delete columns to phoneUsers table
ALTER TABLE `phoneUsers` ADD COLUMN `isDeleted` varchar(5) DEFAULT 'false' NOT NULL;
ALTER TABLE `phoneUsers` ADD COLUMN `deletedAt` bigint;
ALTER TABLE `phoneUsers` ADD COLUMN `deletedBy` int;

-- Create index on isDeleted for faster queries
CREATE INDEX `phoneUsers_isDeleted_idx` ON `phoneUsers` (`isDeleted`);

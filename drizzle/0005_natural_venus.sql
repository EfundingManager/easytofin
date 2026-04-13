ALTER TABLE `phoneUsers` ADD `userId` int;--> statement-breakpoint
ALTER TABLE `phoneUsers` ADD `firstName` text;--> statement-breakpoint
ALTER TABLE `phoneUsers` ADD `lastName` text;--> statement-breakpoint
ALTER TABLE `phoneUsers` ADD `dateOfBirth` timestamp;--> statement-breakpoint
ALTER TABLE `phoneUsers` ADD `nationality` varchar(100);--> statement-breakpoint
ALTER TABLE `phoneUsers` ADD `city` varchar(100);--> statement-breakpoint
ALTER TABLE `phoneUsers` ADD `postalCode` varchar(20);--> statement-breakpoint
ALTER TABLE `phoneUsers` ADD `country` varchar(100);--> statement-breakpoint
ALTER TABLE `phoneUsers` ADD `idType` varchar(50);--> statement-breakpoint
ALTER TABLE `phoneUsers` ADD `idNumber` varchar(100);--> statement-breakpoint
ALTER TABLE `phoneUsers` ADD `idIssueDate` timestamp;--> statement-breakpoint
ALTER TABLE `phoneUsers` ADD `idExpiryDate` timestamp;--> statement-breakpoint
ALTER TABLE `phoneUsers` ADD `occupation` varchar(100);--> statement-breakpoint
ALTER TABLE `phoneUsers` ADD `employerName` varchar(100);--> statement-breakpoint
ALTER TABLE `phoneUsers` ADD `sourceOfIncome` varchar(50);--> statement-breakpoint
ALTER TABLE `phoneUsers` ADD `annualIncome` varchar(50);--> statement-breakpoint
ALTER TABLE `phoneUsers` ADD `politicallyExposed` enum('true','false') DEFAULT 'false' NOT NULL;--> statement-breakpoint
ALTER TABLE `phoneUsers` ADD `pepDetails` text;--> statement-breakpoint
ALTER TABLE `phoneUsers` ADD `kycSubmittedAt` timestamp;--> statement-breakpoint
ALTER TABLE `phoneUsers` ADD `kycVerifiedAt` timestamp;--> statement-breakpoint
ALTER TABLE `phoneUsers` ADD `kycRejectionReason` text;
ALTER TABLE `factFindingForms` ADD `policyNumber` varchar(100);--> statement-breakpoint
ALTER TABLE `factFindingForms` ADD CONSTRAINT `factFindingForms_policyNumber_unique` UNIQUE(`policyNumber`);
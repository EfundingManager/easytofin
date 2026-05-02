CREATE TABLE `userManagementAuditLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phoneUserId` int,
	`actionType` enum('create','edit','delete','restore','role_change','password_reset') NOT NULL,
	`actionBy` int,
	`actionByEmail` varchar(320),
	`targetUserEmail` varchar(320),
	`targetUserName` text,
	`changeDetails` text,
	`reason` text,
	`ipAddress` varchar(45),
	`userAgent` text,
	`status` enum('success','failed','pending') NOT NULL DEFAULT 'success',
	`errorMessage` text,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userManagementAuditLog_id` PRIMARY KEY(`id`)
);

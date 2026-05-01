CREATE TABLE `applicationLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`level` enum('debug','info','warn','error','fatal') NOT NULL,
	`message` text NOT NULL,
	`context` varchar(255),
	`userId` int,
	`phoneUserId` int,
	`requestId` varchar(255),
	`ipAddress` varchar(45),
	`userAgent` text,
	`url` text,
	`method` varchar(10),
	`statusCode` int,
	`errorStack` text,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `applicationLogs_id` PRIMARY KEY(`id`)
);

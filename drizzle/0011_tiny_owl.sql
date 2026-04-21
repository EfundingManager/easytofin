CREATE TABLE `loginAttempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phoneUserId` int,
	`email` varchar(320),
	`phone` varchar(20),
	`attemptType` enum('password','otp','email_link') NOT NULL,
	`status` enum('success','failed') NOT NULL,
	`failureReason` varchar(255),
	`ipAddress` varchar(45),
	`userAgent` text,
	`deviceFingerprint` varchar(255),
	`location` varchar(255),
	`alertSent` enum('true','false') NOT NULL DEFAULT 'false',
	`alertSentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `loginAttempts_id` PRIMARY KEY(`id`)
);

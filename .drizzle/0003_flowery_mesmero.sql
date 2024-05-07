ALTER TABLE attendees ADD `role` text;--> statement-breakpoint
ALTER TABLE `attendees` DROP COLUMN `email`;--> statement-breakpoint
ALTER TABLE `attendees` DROP COLUMN `email_sent`;
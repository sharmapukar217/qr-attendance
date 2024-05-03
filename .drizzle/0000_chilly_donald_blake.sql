CREATE TABLE `attendees` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`email` text NOT NULL,
	`event_id` integer NOT NULL,
	`status` text DEFAULT 'unknown' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`scheduled_date` text NOT NULL,
	`scheduled_time` text DEFAULT 'ALL DAY' NOT NULL,
	`scheduled_location` text DEFAULT 'REMOTE' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);

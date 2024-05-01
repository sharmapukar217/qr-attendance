CREATE TABLE `audiences` (
	`id` integer PRIMARY KEY NOT NULL,
	`event_id` integer,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`status` text DEFAULT 'unknown' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`scheduled_date` text NOT NULL,
	`scheduled_time` text DEFAULT 'ALL DAY' NOT NULL,
	`scheduled_location` text DEFAULT 'REMOTE' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`status` text NOT NULL,
	`error` text,
	`image_path` text,
	`image_type` text,
	`model` text,
	`created_at` integer NOT NULL
);

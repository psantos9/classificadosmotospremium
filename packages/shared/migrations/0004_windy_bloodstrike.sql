PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_mensagem` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer NOT NULL,
	`unread` integer NOT NULL,
	`thread_id` text NOT NULL,
	`recipient_id` integer,
	`recipient_email` text,
	`ad_id` integer NOT NULL,
	`sender_id` integer,
	`unauthenticated_sender` text,
	`content` text NOT NULL,
	FOREIGN KEY (`recipient_id`) REFERENCES `usuario`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`ad_id`) REFERENCES `anuncio`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`sender_id`) REFERENCES `usuario`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_mensagem`("id", "created_at", "unread", "thread_id", "recipient_id", "recipient_email", "ad_id", "sender_id", "unauthenticated_sender", "content") SELECT "id", "created_at", "unread", "thread_id", "recipient_id", "recipient_email", "ad_id", "sender_id", "unauthenticated_sender", "content" FROM `mensagem`;--> statement-breakpoint
DROP TABLE `mensagem`;--> statement-breakpoint
ALTER TABLE `__new_mensagem` RENAME TO `mensagem`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `ad_sender_idx` ON `mensagem` (`ad_id`,`sender_id`);--> statement-breakpoint
CREATE INDEX `thread_idx` ON `mensagem` (`recipient_id`,`thread_id`);
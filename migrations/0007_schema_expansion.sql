ALTER TABLE `categories` ADD `cover_image` text;--> statement-breakpoint
ALTER TABLE `categories` ADD `carousel_images` text;--> statement-breakpoint
ALTER TABLE `categories` ADD `sort_order` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `categories` ADD `is_active` integer DEFAULT true;--> statement-breakpoint
ALTER TABLE `categories` ADD `parent_id` integer;--> statement-breakpoint
ALTER TABLE `products` ADD `subcategory_id` integer REFERENCES categories(id);--> statement-breakpoint
ALTER TABLE `products` ADD `keywords` text;--> statement-breakpoint
ALTER TABLE `products` ADD `purchase_link` text;--> statement-breakpoint
ALTER TABLE `products` ADD `intro_video_url` text;--> statement-breakpoint
ALTER TABLE `products` ADD `list_image` text;--> statement-breakpoint
ALTER TABLE `products` ADD `is_featured` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `products` ADD `sort_order` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
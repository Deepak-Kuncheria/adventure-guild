CREATE TYPE "public"."user_role" AS ENUM('reader', 'author');--> statement-breakpoint
CREATE TABLE "books" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"cover_image_url" text,
	"author_id" uuid NOT NULL,
	"is_published" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"title_search" "tsvector" GENERATED ALWAYS AS (to_tsvector('english', "books"."title")) STORED NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chapters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"book_id" uuid NOT NULL,
	"volume_id" uuid NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"chapter_number" integer NOT NULL,
	"is_published" boolean DEFAULT false,
	"publish_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"title_search" "tsvector" GENERATED ALWAYS AS (to_tsvector('english', "chapters"."title")) STORED NOT NULL,
	"content_search" "tsvector" GENERATED ALWAYS AS (to_tsvector('english', "chapters"."content")) STORED NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"is_published" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"username" varchar(100),
	"user_role" "user_role" DEFAULT 'reader',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "volumes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"book_id" uuid NOT NULL,
	"title" text,
	"volume_number" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"title_search" "tsvector" GENERATED ALWAYS AS (to_tsvector('english', "volumes"."title")) STORED NOT NULL
);
--> statement-breakpoint
ALTER TABLE "books" ADD CONSTRAINT "books_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_volume_id_volumes_id_fk" FOREIGN KEY ("volume_id") REFERENCES "public"."volumes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volumes" ADD CONSTRAINT "volumes_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "book_title_idx" ON "books" USING btree ("title");--> statement-breakpoint
CREATE INDEX "book_isPublish_idx" ON "books" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "book_title_isPublish_idx" ON "books" USING btree ("is_published","title");--> statement-breakpoint
CREATE INDEX "search_book_title_idx" ON "books" USING gin ("title_search");--> statement-breakpoint
CREATE INDEX "chapter_title_idx" ON "chapters" USING btree ("title");--> statement-breakpoint
CREATE INDEX "chapter_bookId_idx" ON "chapters" USING btree ("book_id");--> statement-breakpoint
CREATE INDEX "chapter_number_idx" ON "chapters" USING btree ("chapter_number");--> statement-breakpoint
CREATE INDEX "chapter_isPublish_idx" ON "chapters" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "chapter_publishDate_idx" ON "chapters" USING btree ("publish_date");--> statement-breakpoint
CREATE INDEX "chapter_title_bookId_idx" ON "chapters" USING btree ("book_id","title");--> statement-breakpoint
CREATE INDEX "chapter_volumeId_title_idx" ON "chapters" USING btree ("volume_id","title");--> statement-breakpoint
CREATE INDEX "chapter_all_idx" ON "chapters" USING btree ("book_id","volume_id","is_published","publish_date","title");--> statement-breakpoint
CREATE INDEX "search_chapter_title_idx" ON "chapters" USING gin ("title_search");--> statement-breakpoint
CREATE INDEX "search_chapter_content_idx" ON "chapters" USING gin ("content_search");--> statement-breakpoint
CREATE INDEX "notice_isPublish_idx" ON "notices" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "notice_title_idx" ON "notices" USING btree ("title");--> statement-breakpoint
CREATE INDEX "notice_createdAt_idx" ON "notices" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "emailUniqueIndex" ON "users" USING btree (lower("email"));--> statement-breakpoint
CREATE INDEX "username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "userRole_idx" ON "users" USING btree ("user_role");--> statement-breakpoint
CREATE INDEX "volume_title_idx" ON "volumes" USING btree ("title");--> statement-breakpoint
CREATE INDEX "volume_bookId_idx" ON "volumes" USING btree ("book_id");--> statement-breakpoint
CREATE INDEX "volume_title_bookId_idx" ON "volumes" USING btree ("book_id","title");--> statement-breakpoint
CREATE INDEX "search_volume_title_idx" ON "volumes" USING gin ("title_search");
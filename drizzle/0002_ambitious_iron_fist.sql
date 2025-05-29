ALTER TABLE "books" DROP CONSTRAINT "books_author_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "chapters" DROP CONSTRAINT "chapters_book_id_books_id_fk";
--> statement-breakpoint
ALTER TABLE "chapters" DROP CONSTRAINT "chapters_volume_id_volumes_id_fk";
--> statement-breakpoint
ALTER TABLE "refresh_tokens" DROP CONSTRAINT "refresh_tokens_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "volumes" DROP CONSTRAINT "volumes_book_id_books_id_fk";
--> statement-breakpoint
ALTER TABLE "books" ADD CONSTRAINT "books_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_volume_id_volumes_id_fk" FOREIGN KEY ("volume_id") REFERENCES "public"."volumes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volumes" ADD CONSTRAINT "volumes_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "book_title_idx" ON "books" USING btree ("title");--> statement-breakpoint
CREATE INDEX "book_isPublish_idx" ON "books" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "book_title_isPublish_idx" ON "books" USING btree ("is_published","title");--> statement-breakpoint
CREATE INDEX "chapter_title_idx" ON "chapters" USING btree ("title");--> statement-breakpoint
CREATE INDEX "chapter_bookId_idx" ON "chapters" USING btree ("book_id");--> statement-breakpoint
CREATE INDEX "chapter_number_idx" ON "chapters" USING btree ("chapter_number");--> statement-breakpoint
CREATE INDEX "chapter_isPublish_idx" ON "chapters" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "chapter_publishDate_idx" ON "chapters" USING btree ("publish_date");--> statement-breakpoint
CREATE INDEX "chapter_title_bookId_idx" ON "chapters" USING btree ("book_id","title");--> statement-breakpoint
CREATE INDEX "chapter_volumeId_title_idx" ON "chapters" USING btree ("volume_id","title");--> statement-breakpoint
CREATE INDEX "chapter_all_idx" ON "chapters" USING btree ("book_id","volume_id","is_published","publish_date","title");--> statement-breakpoint
CREATE INDEX "notice_isPublish_idx" ON "notices" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "notice_title_idx" ON "notices" USING btree ("title");--> statement-breakpoint
CREATE INDEX "notice_createdAt_idx" ON "notices" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "userRole_idx" ON "users" USING btree ("user_role");--> statement-breakpoint
CREATE INDEX "volume_title_idx" ON "volumes" USING btree ("title");--> statement-breakpoint
CREATE INDEX "volume_bookId_idx" ON "volumes" USING btree ("book_id");--> statement-breakpoint
CREATE INDEX "volume_title_bookId_idx" ON "volumes" USING btree ("book_id","title");
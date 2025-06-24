import { db } from "@/db";
import { books } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function findBookBySlug(slug: string) {
  return db.query.books.findFirst({ where: eq(books.slug, slug) });
}

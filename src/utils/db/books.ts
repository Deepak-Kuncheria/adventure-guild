import { db } from "@/db";
import { books } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function findBookBySlug(slug: string) {
  return db.query.books.findFirst({ where: eq(books.slug, slug) });
}

export async function findBookSlugById(id: string) {
  const book = await db.query.books.findFirst({
    columns: {
      slug: true,
    },
    where: eq(books.id, id),
  });
  if (book && "slug" in book) {
    return book.slug;
  }
  return null;
}

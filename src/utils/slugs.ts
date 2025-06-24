import slugify from "slugify";
import { findBookBySlug } from "./db/books";
export function generateSlug(item: string) {
  return slugify(item, { lower: true, strict: true, trim: true });
}

// For books: globally unique slugs
export async function generateUniqueBookSlug(title: string): Promise<string> {
  const base = generateSlug(title) || "book";
  let slug = base;

  let count = 1;

  // Check for duplicates and add suffix if needed
  while (await findBookBySlug(slug)) {
    slug = `${base}-${count++}`;
  }

  return slug;
}

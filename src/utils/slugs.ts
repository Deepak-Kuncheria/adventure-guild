import slugify from "slugify";
import { findBookBySlug } from "./db/books";
import { MAX_SLUG_CHARACTER_LIMIT } from "@/constants/slugs";
export function generateSlug(item: string) {
  const newItem =
    item.length > MAX_SLUG_CHARACTER_LIMIT
      ? item.slice(0, MAX_SLUG_CHARACTER_LIMIT)
      : item;
  return slugify(newItem, { lower: true, strict: true, trim: true });
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

import { BOOK_ID_REQ, BOOK_NOT_FOUND } from "@/constants/errors/bookErrors";
import { SERVER_ERROR } from "@/constants/errors/commonErrors";
import { db } from "@/db";
import { books, chapters, volumes } from "@/db/schema";
import { checkAuthorRole } from "@/utils/authorize";
import { and, eq } from "drizzle-orm";
import { validate as uuidValidate } from "uuid";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ item: string }> }
) {
  try {
    const { item } = await params;

    if (!item || item.trim() === "") {
      return Response.json({ error: BOOK_ID_REQ }, { status: 400 });
    }
    const author = await checkAuthorRole();
    let bookWhereClause;

    if (uuidValidate(item)) {
      bookWhereClause = eq(books.id, item);
    } else {
      bookWhereClause = eq(books.slug, item);
    }
    if (author.status === false) {
      bookWhereClause = and(bookWhereClause, eq(books.isPublished, true));
    }
    const book = await db.select().from(books).where(bookWhereClause);
    if (book.length === 0)
      return Response.json({ error: BOOK_NOT_FOUND }, { status: 404 });
    const volumeIds = await db
      .select({ id: volumes.id })
      .from(volumes)
      .where(eq(volumes.bookId, book[0].id));

    const chapterStatement = author.status
      ? eq(chapters.bookId, book[0].id)
      : and(eq(chapters.bookId, book[0].id), eq(chapters.isPublished, true));

    const chapterIds = await db
      .select({ id: chapters.id })
      .from(chapters)
      .where(chapterStatement);

    return Response.json(
      {
        data: {
          book: book[0],
          volumes: volumeIds,
          chapters: chapterIds,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return Response.json({ error: SERVER_ERROR }, { status: 500 });
  }
}

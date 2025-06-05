import {
  CHAPTER_BOOK_NOT_FOUND,
  CHAPTER_INCORRECT_PUBLISH_DATE,
  CHAPTER_REQ_PARAMS,
  CHAPTER_VOLUME_NOT_FOUND,
} from "@/constants/errors/chapterErrors";
import { SERVER_ERROR } from "@/constants/errors/commonErrors";
import { db } from "@/db";
import { books, chapters, volumes } from "@/db/schema";
import { checkAuthorRole } from "@/utils/authorize";
import { isValidTimestamp } from "@/utils/forTimestamps";
import { and, count, eq } from "drizzle-orm";

export async function GET() {
  try {
    const isAdmin = await checkAuthorRole();
    let allChapters;
    const aChapter = {
      title: chapters.title,
      id: chapters.id,
      isPublished: chapters.isPublished,
      chapterNumber: chapters.chapterNumber,
      bookId: chapters.bookId,
    };
    if (isAdmin.status) {
      allChapters = await db.select(aChapter).from(chapters);
    } else {
      // for non admin users, show only published books.
      allChapters = await db
        .select(aChapter)
        .from(chapters)
        .where(eq(chapters.isPublished, true));
    }
    return Response.json({ data: allChapters }, { status: 200 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: SERVER_ERROR }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { title, content, isPublished, bookId, volumeId, publishDate } =
      await req.json();

    if (
      !title ||
      !content ||
      !bookId ||
      !volumeId ||
      (isPublished && !publishDate)
    ) {
      return Response.json({ error: CHAPTER_REQ_PARAMS }, { status: 400 });
    }

    const author = await checkAuthorRole();
    if (!author.status) {
      return author.response;
    }

    if (isPublished && !isValidTimestamp(publishDate)) {
      return Response.json(
        { error: CHAPTER_INCORRECT_PUBLISH_DATE },
        { status: 400 }
      );
    }
    const book = await db
      .select({ id: books.id })
      .from(books)
      .where(eq(books.id, bookId));
    if (book.length === 0) {
      return Response.json({ error: CHAPTER_BOOK_NOT_FOUND }, { status: 404 });
    }
    const volume = await db
      .select({ id: volumes.id })
      .from(volumes)
      .where(and(eq(volumes.id, volumeId), eq(volumes.bookId, bookId)));
    if (volume.length === 0) {
      return Response.json(
        { error: CHAPTER_VOLUME_NOT_FOUND },
        { status: 404 }
      );
    }
    const currentChapters = await db
      .select({ count: count() })
      .from(chapters)
      .where(and(eq(chapters.bookId, bookId), eq(chapters.volumeId, volumeId)));
    const chapterNumber = currentChapters[0].count + 1;

    const newChapter = await db
      .insert(chapters)
      .values({
        title,
        content,
        bookId,
        volumeId,
        isPublished,
        chapterNumber,
        publishDate: publishDate ? new Date(publishDate) : new Date(),
      })
      .returning();

    return Response.json({ data: newChapter[0] }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: SERVER_ERROR }, { status: 500 });
  }
}

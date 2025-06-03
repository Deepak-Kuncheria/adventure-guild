import { ACCESS_DENIED } from "@/constants/errors/authErrors";
import {
  CHAPTER_BOOK_NOT_FOUND,
  CHAPTER_INCORRECT_PUBLISH_DATE,
  CHAPTER_REQ_PARAMS,
  CHAPTER_VOLUME_NOT_FOUND,
} from "@/constants/errors/chapterErrors";
import { SERVER_ERROR } from "@/constants/errors/commonErrors";
import { db } from "@/db";
import { books, chapters, USER_ROLE_CONSTANT, volumes } from "@/db/schema";
import { decodeAccessTokenForAPI } from "@/utils/forAuthTokens";
import { isValidTimestamp } from "@/utils/forTimestamps";
import { getUserRoleById } from "@/utils/usersDB";
import { and, count, eq } from "drizzle-orm";

export async function GET() {
  try {
    let isAdmin = false;
    //  find whether user is admin or not
    const decodedToken = await decodeAccessTokenForAPI();
    if (
      decodedToken &&
      Object.keys(decodedToken).length > 0 &&
      "userId" in decodedToken
    ) {
      const userRole = await getUserRoleById(decodedToken?.userId as string);
      if (userRole && userRole === USER_ROLE_CONSTANT.AUTHOR) {
        isAdmin = true;
      }
    }

    let allChapters;
    const aChapter = {
      title: chapters.title,
      id: chapters.id,
      isPublished: chapters.isPublished,
      chapterNumber: chapters.chapterNumber,
      bookId: chapters.bookId,
    };
    if (isAdmin) {
      allChapters = await db.select(aChapter).from(chapters);
    } else {
      // for non admin users, show only published books.
      allChapters = await db
        .select(aChapter)
        .from(chapters)
        .where(eq(chapters.isPublished, true));
    }
    return Response.json({ chapters: allChapters }, { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(SERVER_ERROR, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { title, content, isPublished, bookId, volumeId, publishDate } =
      await req.json();

    if (
      !title ||
      !content ||
      !isPublished ||
      !bookId ||
      !volumeId ||
      (isPublished && !publishDate)
    ) {
      return new Response(CHAPTER_REQ_PARAMS, { status: 400 });
    }

    const decodedToken = await decodeAccessTokenForAPI();
    if (!decodedToken) {
      return new Response(ACCESS_DENIED, { status: 401 });
    }
    const role = await getUserRoleById(decodedToken.userId);
    if (role !== USER_ROLE_CONSTANT.AUTHOR) {
      return new Response(ACCESS_DENIED, { status: 403 });
    }
    if (isPublished && !isValidTimestamp(publishDate)) {
      return new Response(CHAPTER_INCORRECT_PUBLISH_DATE, { status: 400 });
    }
    const book = await db
      .select({ id: books.id })
      .from(books)
      .where(eq(books.id, bookId));
    if (book.length === 0) {
      return new Response(CHAPTER_BOOK_NOT_FOUND, { status: 404 });
    }
    const volume = await db
      .select({ id: volumes.id })
      .from(volumes)
      .where(and(eq(volumes.id, volumeId), eq(volumes.bookId, bookId)));
    if (volume.length === 0) {
      return new Response(CHAPTER_VOLUME_NOT_FOUND, { status: 404 });
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
        publishDate,
      })
      .returning();

    return Response.json({ data: newChapter[0] }, { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(SERVER_ERROR, { status: 500 });
  }
}

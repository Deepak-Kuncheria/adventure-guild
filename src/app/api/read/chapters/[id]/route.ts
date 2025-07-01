import {
  CHAPTER_ID_REQ,
  CHAPTER_NOT_FOUND,
} from "@/constants/errors/chapterErrors";
import { SERVER_ERROR } from "@/constants/errors/commonErrors";
import { db } from "@/db";
import { chapters } from "@/db/schema";
import { checkAuthorRole } from "@/utils/authorize";
import { and, asc, desc, eq, gt, lt } from "drizzle-orm";
import { validate as uuidValidate } from "uuid";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || !uuidValidate(id)) {
      return Response.json({ error: CHAPTER_ID_REQ }, { status: 400 });
    }
    const author = await checkAuthorRole();
    const chapterWhereClause =
      author.status === false
        ? and(eq(chapters.id, id), eq(chapters.isPublished, true))
        : eq(chapters.id, id);

    const currentChapter = await db.query.chapters.findFirst({
      columns: {
        createdAt: false,
        updatedAt: false,
        titleSearch: false,
        contentSearch: false,
        volumeId: false,
        isPublished: false,
      },
      where: chapterWhereClause,
    });

    if (!currentChapter) {
      return Response.json({ error: CHAPTER_NOT_FOUND }, { status: 404 });
    }
    const previousChapterId = await db.query.chapters.findFirst({
      columns: {
        id: true,
      },
      where:
        author.status === false
          ? and(
              eq(chapters.bookId, currentChapter.bookId),
              lt(chapters.chapterNumber, currentChapter.chapterNumber),
              eq(chapters.isPublished, true)
            )
          : and(
              eq(chapters.bookId, currentChapter.bookId),
              lt(chapters.chapterNumber, currentChapter.chapterNumber)
            ),
      orderBy: desc(chapters.chapterNumber),
    });
    const nextChapterId = await db.query.chapters.findFirst({
      columns: {
        id: true,
      },
      where:
        author.status === false
          ? and(
              eq(chapters.bookId, currentChapter.bookId),
              gt(chapters.chapterNumber, currentChapter.chapterNumber),
              eq(chapters.isPublished, true)
            )
          : and(
              eq(chapters.bookId, currentChapter.bookId),
              gt(chapters.chapterNumber, currentChapter.chapterNumber)
            ),
      orderBy: asc(chapters.chapterNumber),
    });
    return Response.json(
      {
        data: {
          current: currentChapter,
          prevId: previousChapterId?.id || null,
          nextId: nextChapterId?.id || null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return Response.json({ error: SERVER_ERROR }, { status: 500 });
  }
}

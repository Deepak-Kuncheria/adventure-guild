import {
  CHAPTER_ID_REQ,
  CHAPTER_INCORRECT_PUBLISH_DATE,
  CHAPTER_NOT_FOUND,
  CHAPTER_REQ_PARAMS,
  CHAPTER_UPDATE_REQ_PARAMS,
} from "@/constants/errors/chapterErrors";
import { SERVER_ERROR } from "@/constants/errors/commonErrors";
import { db } from "@/db";
import { chapters } from "@/db/schema";
import { checkAuthorRole } from "@/utils/authorize";
import { isValidTimestamp } from "@/utils/forTimestamps";
import { eq } from "drizzle-orm";
import { validate as uuidValidate } from "uuid";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  try {
    const { chapterId } = await params;
    let body;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: CHAPTER_REQ_PARAMS }, { status: 400 });
    }
    if (!chapterId || !uuidValidate(chapterId)) {
      return Response.json({ error: CHAPTER_ID_REQ }, { status: 400 });
    }
    const author = await checkAuthorRole();
    if (!author.status) {
      return author.response;
    }
    const updateData: {
      [key: string]: string | boolean | Date | undefined;
      title?: string;
      content?: string;
      publishDate?: Date;
      isPublished?: boolean;
    } = {};
    const allowedFields = [
      { key: "title", type: "string" },
      { key: "content", type: "string" },
      { key: "isPublished", type: "boolean" },
    ];
    for (let i = 0; i < allowedFields.length; i++) {
      if (
        allowedFields[i].key in body &&
        typeof body[allowedFields[i].key] === allowedFields[i].type
      ) {
        const key = allowedFields[i].key;
        updateData[key] = body[key];
      }
    }
    if (Object.keys(updateData).length === 0)
      return Response.json(
        { error: CHAPTER_UPDATE_REQ_PARAMS },
        { status: 400 }
      );

    if (updateData.isPublished) {
      if (
        !("publishDate" in body) ||
        ("publishDate" in body &&
          body.publishDate &&
          !isValidTimestamp(body.publishDate))
      ) {
        return Response.json(
          { error: CHAPTER_INCORRECT_PUBLISH_DATE },
          { status: 400 }
        );
      } else if ("publishDate" in body) {
        updateData["publishDate"] = new Date(body.publishDate);
      }
    }
    const updatedChapter = await db
      .update(chapters)
      .set(updateData)
      .where(eq(chapters.id, chapterId))
      .returning();
    if (updatedChapter.length === 0)
      return Response.json({ error: CHAPTER_NOT_FOUND }, { status: 404 });
    return Response.json({ data: updatedChapter[0] }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: SERVER_ERROR }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ chapterId: string }>;
  }
) {
  try {
    const { chapterId } = await params;
    if (!chapterId || !uuidValidate(chapterId)) {
      return Response.json({ error: CHAPTER_ID_REQ }, { status: 400 });
    }

    const author = await checkAuthorRole();
    if (!author.status) {
      return author.response;
    }

    const deletedChapter = await db
      .delete(chapters)
      .where(eq(chapters.id, chapterId))
      .returning({ deletedTitle: chapters.title });
    if (deletedChapter.length === 0)
      return Response.json({ error: CHAPTER_NOT_FOUND }, { status: 404 });
    return Response.json(
      { data: deletedChapter[0].deletedTitle },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return Response.json({ error: SERVER_ERROR }, { status: 500 });
  }
}

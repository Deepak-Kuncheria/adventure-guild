import { BOOK_TITLE_EMPTY } from "@/constants/errors/bookErrors";
import { SERVER_ERROR } from "@/constants/errors/commonErrors";
import {
  VOLUME_ID_IS_REQ,
  VOLUME_NOT_FOUND,
  VOLUME_RELEVANT_PARAMS,
} from "@/constants/errors/volumeErrors";
import { db } from "@/db";
import { volumes } from "@/db/schema";
import { checkAuthorRole } from "@/utils/authorize";
import { eq } from "drizzle-orm";
import { validate as uuidValidate } from "uuid";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ volumeId: string }> }
) {
  try {
    const { volumeId } = await params;
    let body;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: VOLUME_RELEVANT_PARAMS }, { status: 400 });
    }
    if (!volumeId || !uuidValidate(volumeId)) {
      return Response.json({ error: VOLUME_ID_IS_REQ }, { status: 400 });
    }
    const author = await checkAuthorRole();
    if (!author.status) {
      return author.response;
    }

    const updateData: {
      [key: string]: string | boolean | undefined;
      title?: string;
    } = {};
    const allowedFields = [{ key: "title", type: "string" }];
    for (let i = 0; i < allowedFields.length; i++) {
      if (
        allowedFields[i].key in body &&
        typeof body[allowedFields[i].key] === allowedFields[i].type
      ) {
        const key = allowedFields[i].key;
        if (i === 0 && body[key].trim() === "") {
          return Response.json({ error: BOOK_TITLE_EMPTY }, { status: 400 });
        }
        updateData[key] = body[key];
      }
    }
    if (Object.keys(updateData).length === 0)
      return Response.json({ error: VOLUME_RELEVANT_PARAMS }, { status: 400 });
    const updatedVolume = await db
      .update(volumes)
      .set(updateData)
      .where(eq(volumes.id, volumeId))
      .returning();
    if (updatedVolume.length === 0)
      return Response.json({ error: VOLUME_NOT_FOUND }, { status: 404 });
    return Response.json({ data: updatedVolume[0] }, { status: 200 });
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
    params: Promise<{ volumeId: string }>;
  }
) {
  try {
    const { volumeId } = await params;
    if (!volumeId || !uuidValidate(volumeId)) {
      return Response.json({ error: VOLUME_ID_IS_REQ }, { status: 400 });
    }

    const author = await checkAuthorRole();
    if (!author.status) {
      return author.response;
    }

    const deletedVol = await db
      .delete(volumes)
      .where(eq(volumes.id, volumeId))
      .returning({ deletedTitle: volumes.title });
    if (deletedVol.length === 0)
      return Response.json({ error: VOLUME_NOT_FOUND }, { status: 404 });
    return Response.json({ data: deletedVol[0].deletedTitle }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: SERVER_ERROR }, { status: 500 });
  }
}

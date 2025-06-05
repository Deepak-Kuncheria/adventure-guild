import { ACCESS_DENIED } from "@/constants/errors/authErrors";
import { SERVER_ERROR } from "@/constants/errors/commonErrors";
import { VOLUME_TITLE_AND_BOOK_ID_REQ } from "@/constants/errors/volumeErrors";
import { db } from "@/db";
import { USER_ROLE_CONSTANT, volumes } from "@/db/schema";
import { decodeAccessTokenForAPI } from "@/utils/forAuthTokens";
import { getUserRoleById } from "@/utils/usersDB";
import { count, eq } from "drizzle-orm";

export async function GET() {
  try {
    const decodedToken = await decodeAccessTokenForAPI();
    if (!decodedToken) {
      return Response.json({ error: ACCESS_DENIED }, { status: 401 });
    }
    const role = await getUserRoleById(decodedToken.userId);
    if (role !== USER_ROLE_CONSTANT.AUTHOR) {
      return Response.json({ error: ACCESS_DENIED }, { status: 403 });
    }
    const allVolumes = await db.select().from(volumes);
    return Response.json({ data: allVolumes }, { status: 200 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: SERVER_ERROR }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { bookId, title } = await req.json();

    if (!title || !bookId) {
      return Response.json(
        { error: VOLUME_TITLE_AND_BOOK_ID_REQ },
        { status: 400 }
      );
    }
    const decodedToken = await decodeAccessTokenForAPI();
    if (!decodedToken) {
      return Response.json({ error: ACCESS_DENIED }, { status: 401 });
    }
    const role = await getUserRoleById(decodedToken.userId);
    if (role !== USER_ROLE_CONSTANT.AUTHOR) {
      return Response.json({ error: ACCESS_DENIED }, { status: 403 });
    }
    const currentAllVols = await db
      .select({ count: count() })
      .from(volumes)
      .where(eq(volumes.bookId, bookId));
    const newVolume = await db
      .insert(volumes)
      .values({
        title,
        bookId,
        volumeNumber: currentAllVols[0].count + 1,
      })
      .returning();

    return Response.json({ data: newVolume[0] }, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: SERVER_ERROR }, { status: 500 });
  }
}

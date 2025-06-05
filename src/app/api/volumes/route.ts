import { SERVER_ERROR } from "@/constants/errors/commonErrors";
import { VOLUME_TITLE_AND_BOOK_ID_REQ } from "@/constants/errors/volumeErrors";
import { db } from "@/db";
import { volumes } from "@/db/schema";
import { checkAuthorRole } from "@/utils/authorize";
import { count, eq } from "drizzle-orm";

export async function GET() {
  try {
    const author = await checkAuthorRole();
    if (!author.status) {
      return author.response;
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
    const author = await checkAuthorRole();
    if (!author.status) {
      return author.response;
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

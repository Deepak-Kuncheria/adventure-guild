import errorMessages from "@/constants/errorMessages";
import { db } from "@/db";
import { books, userRoleEnum } from "@/db/schema";
import { decodeAccessTokenForAPI } from "@/utils/forAuthTokens";
import { getUserRoleById } from "@/utils/usersDB";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { bookId } = await params;
    const body = await req.json();

    if (!bookId) {
      return new Response("Book Id is a required parameter", { status: 400 });
    }
    const decodedToken = await decodeAccessTokenForAPI();
    if (!decodedToken) {
      return new Response(errorMessages.ACCESS_DENIED, { status: 401 });
    }
    const role = await getUserRoleById(decodedToken.userId);
    if (role !== userRoleEnum.enumValues[1]) {
      return new Response(errorMessages.ACCESS_DENIED, { status: 403 });
    }
    const updateData: {
      [key: string]: string | boolean | undefined;
      title?: string;
      description?: string;
      coverImageUrl?: string;
      isPublished?: boolean;
    } = {};
    const allowedFields = [
      { key: "title", type: "string" },
      { key: "description", type: "string" },
      { key: "coverImageUrl", type: "string" },
      { key: "isPublished", type: "boolean" },
    ];
    for (let i = 0; i < allowedFields.length; i++) {
      if (
        allowedFields[i].key in body &&
        typeof body[allowedFields[i].key] === allowedFields[i].type
      ) {
        const key = allowedFields[i].key;
        if (i === 0 && body[key].trim() === "") {
          return new Response("Book title cannot be empty.", { status: 400 });
        }
        updateData[key] = body[key];
      }
    }
    if (Object.keys(updateData).length === 0)
      return new Response(
        "Respective book parameters was not sent with request.",
        { status: 400 }
      );
    const newBook = await db
      .update(books)
      .set(updateData)
      .where(eq(books.id, bookId))
      .returning();

    return Response.json({ data: newBook[0] }, { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(errorMessages.SERVER_ERROR, { status: 500 });
  }
}

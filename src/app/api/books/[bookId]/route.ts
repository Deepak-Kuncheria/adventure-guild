import { ACCESS_DENIED } from "@/constants/errors/authErrors";
import {
  BOOK_ID_REQ,
  BOOK_NOT_FOUND,
  BOOK_PARAMS_RELEVANT,
  BOOK_TITLE_EMPTY,
} from "@/constants/errors/bookErrors";
import { SERVER_ERROR } from "@/constants/errors/commonErrors";
import { db } from "@/db";
import { books, USER_ROLE_CONSTANT } from "@/db/schema";
import { decodeAccessTokenForAPI } from "@/utils/forAuthTokens";
import { getUserRoleById } from "@/utils/usersDB";
import { eq } from "drizzle-orm";
import { validate as uuidValidate } from "uuid";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { bookId } = await params;
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(BOOK_PARAMS_RELEVANT, { status: 400 });
    }
    if (!bookId || !uuidValidate(bookId)) {
      return new Response(BOOK_ID_REQ, { status: 400 });
    }
    const decodedToken = await decodeAccessTokenForAPI();
    if (!decodedToken) {
      return new Response(ACCESS_DENIED, { status: 401 });
    }
    const role = await getUserRoleById(decodedToken.userId);
    if (role !== USER_ROLE_CONSTANT.AUTHOR) {
      return new Response(ACCESS_DENIED, { status: 403 });
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
          return new Response(BOOK_TITLE_EMPTY, { status: 400 });
        }
        updateData[key] = body[key];
      }
    }
    if (Object.keys(updateData).length === 0)
      return new Response(BOOK_PARAMS_RELEVANT, { status: 400 });
    const updatedBook = await db
      .update(books)
      .set(updateData)
      .where(eq(books.id, bookId))
      .returning();
    if (updatedBook.length === 0)
      return new Response(BOOK_NOT_FOUND, { status: 404 });
    return Response.json({ data: updatedBook[0] }, { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(SERVER_ERROR, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ bookId: string }>;
  }
) {
  try {
    const { bookId } = await params;
    if (!bookId || !uuidValidate(bookId)) {
      return new Response(BOOK_ID_REQ, { status: 400 });
    }

    const decodedToken = await decodeAccessTokenForAPI();
    if (!decodedToken) {
      return new Response(ACCESS_DENIED, { status: 401 });
    }
    const role = await getUserRoleById(decodedToken.userId);
    if (role !== USER_ROLE_CONSTANT.AUTHOR) {
      return new Response(ACCESS_DENIED, { status: 403 });
    }

    const deletedBook = await db
      .delete(books)
      .where(eq(books.id, bookId))
      .returning({ deletedTitle: books.title });
    if (deletedBook.length === 0)
      return new Response(BOOK_NOT_FOUND, { status: 404 });
    return Response.json(
      { data: deletedBook[0].deletedTitle },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(SERVER_ERROR, { status: 500 });
  }
}

import { ACCESS_DENIED } from "@/constants/errors/authErrors";
import { SERVER_ERROR } from "@/constants/errors/commonErrors";
import { db } from "@/db";
import { books, USER_ROLE_CONSTANT } from "@/db/schema";
import { decodeAccessTokenForAPI } from "@/utils/forAuthTokens";
import { getUserRoleById } from "@/utils/usersDB";
import { eq } from "drizzle-orm";

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

    let allBooks;
    if (isAdmin) {
      allBooks = await db.select().from(books);
    } else {
      // for non admin users, show only published books.
      allBooks = await db
        .select()
        .from(books)
        .where(eq(books.isPublished, true));
    }
    return Response.json({ books: allBooks }, { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(SERVER_ERROR, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { title, description, coverImageUrl } = await req.json();

    if (!title) {
      return new Response("Title is required", { status: 400 });
    }
    const decodedToken = await decodeAccessTokenForAPI();
    if (!decodedToken) {
      return new Response(ACCESS_DENIED, { status: 401 });
    }
    const role = await getUserRoleById(decodedToken.userId);
    if (role !== USER_ROLE_CONSTANT.AUTHOR) {
      return new Response(ACCESS_DENIED, { status: 403 });
    }
    const newBook = await db
      .insert(books)
      .values({
        title,
        description,
        coverImageUrl,
        authorId: decodedToken.userId,
      })
      .returning();

    return Response.json({ data: newBook[0] }, { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(SERVER_ERROR, { status: 500 });
  }
}

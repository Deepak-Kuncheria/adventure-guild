import errorMessages from "@/constants/errorMessages";
import { db } from "@/db";
import { books, userRoleEnum } from "@/db/schema";
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
      if (userRole && userRole === userRoleEnum.enumValues[1]) {
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
    return Response.json({ books: allBooks });
  } catch (err) {
    console.error(err);
    return new Response(errorMessages.SERVER_ERROR, { status: 500 });
  }
}

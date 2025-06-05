import { BOOK_TITLE_REQ } from "@/constants/errors/bookErrors";
import { SERVER_ERROR } from "@/constants/errors/commonErrors";
import { db } from "@/db";
import { books } from "@/db/schema";
import { checkAuthorRole } from "@/utils/authorize";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const isAdmin = await checkAuthorRole();

    let allBooks;
    if (isAdmin.status) {
      allBooks = await db.select().from(books);
    } else {
      // for non admin users, show only published books.
      allBooks = await db
        .select()
        .from(books)
        .where(eq(books.isPublished, true));
    }
    return Response.json({ data: allBooks }, { status: 200 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: SERVER_ERROR }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { title, description, coverImageUrl } = await req.json();

    if (!title) {
      return Response.json({ error: BOOK_TITLE_REQ }, { status: 400 });
    }
    const author = await checkAuthorRole();
    if (!author.status) {
      return author.response;
    }
    const newBook = await db
      .insert(books)
      .values({
        title,
        description,
        coverImageUrl,
        authorId: author.userId,
      })
      .returning();

    return Response.json({ data: newBook[0] }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: SERVER_ERROR }, { status: 500 });
  }
}

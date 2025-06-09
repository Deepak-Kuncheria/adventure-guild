import { SERVER_ERROR } from "@/constants/errors/commonErrors";
import { books, chapters, volumes } from "@/db/schema";
import { checkAuthorRole } from "@/utils/authorize";
import { searchInTable } from "@/utils/forSearch";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ item: string }> }
) {
  try {
    const { item } = await params;
    if (item.trim() === "") {
      return Response.json(
        { error: "The search item is empty" },
        { status: 400 }
      );
    }
    const author = await checkAuthorRole();
    const searchLimit = 5;
    const bookResults = await searchInTable(
      books,
      author.status,
      item,
      searchLimit
    );
    const volumeResults = await searchInTable(
      volumes,
      author.status,
      item,
      searchLimit
    );
    const chapterRes = await searchInTable(
      chapters,
      author.status,
      item,
      searchLimit
    );

    return Response.json(
      {
        data: {
          books: bookResults,
          volumes: volumeResults,
          chapters: chapterRes,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return Response.json({ error: SERVER_ERROR }, { status: 500 });
  }
}

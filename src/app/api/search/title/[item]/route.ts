import { SERVER_ERROR } from "@/constants/errors/commonErrors";
import { SEARCH_TERM_EMPTY } from "@/constants/errors/searchErrors";
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
      return Response.json({ error: SEARCH_TERM_EMPTY }, { status: 400 });
    }
    const author = await checkAuthorRole();

    const bookResults = await searchInTable(books, author.status, item);
    const volumeResults = await searchInTable(volumes, author.status, item);
    const chapterRes = await searchInTable(chapters, author.status, item);

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

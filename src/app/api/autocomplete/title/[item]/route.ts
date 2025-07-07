import { SERVER_ERROR } from "@/constants/errors/commonErrors";
import { SEARCH_TERM_EMPTY } from "@/constants/errors/searchErrors";
import { searchTableEnum } from "@/constants/search/searchTableEnum";
import { books, chapters, volumes } from "@/db/schema";
import { checkAuthorRole } from "@/utils/authorize";
import { addSlugToResult, searchInTable } from "@/utils/forSearch";

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
    const searchLimit = 3;

    const bookResults = await searchInTable(
      books,
      author.status,
      item,
      searchTableEnum.BOOKS,
      searchLimit
    );
    const bookResWithSlug = await Promise.all(
      bookResults.map((res) => addSlugToResult(res))
    );
    const volumeResults = await searchInTable(
      volumes,
      author.status,
      item,
      searchTableEnum.VOLUMES,
      searchLimit
    );
    const volumeResWithSlug = await Promise.all(
      volumeResults.map((res) => addSlugToResult(res))
    );
    const chapterResults = await searchInTable(
      chapters,
      author.status,
      item,
      searchTableEnum.CHAPTERS,
      searchLimit
    );
    const chapterResWithSlug = await Promise.all(
      chapterResults.map((res) => addSlugToResult(res))
    );
    return Response.json(
      {
        data: {
          books: bookResWithSlug,
          volumes: volumeResWithSlug,
          chapters: chapterResWithSlug,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return Response.json({ error: SERVER_ERROR }, { status: 500 });
  }
}

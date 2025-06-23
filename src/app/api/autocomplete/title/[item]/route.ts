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
    const searchLimit = 3;
    const tables = [books, volumes, chapters];
    const allResults = await Promise.all(
      tables.map((table) =>
        searchInTable(table, author.status, item, searchLimit)
      )
    );

    const results = allResults
      .flat()
      .sort((a, b) => b.rankCd - a.rankCd)
      .slice(0, 5);

    return Response.json(
      {
        data: results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return Response.json({ error: SERVER_ERROR }, { status: 500 });
  }
}

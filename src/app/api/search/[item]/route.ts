import { SERVER_ERROR } from "@/constants/errors/commonErrors";
import { SEARCH_TITLE_LIMIT } from "@/constants/search/queryLimit";
import { db } from "@/db";
import { books, chapters, volumes } from "@/db/schema";
import { checkAuthorRole } from "@/utils/authorize";
import { matchQuery } from "@/utils/forSearch";
import { and, desc, eq, sql } from "drizzle-orm";

async function searchInTable(
  tableToSearch: typeof books | typeof chapters | typeof volumes,
  isAuthor: boolean,
  searchItem: string
) {
  const whereClause =
    isAuthor || !("isPublished" in tableToSearch)
      ? sql`setweight(to_tsvector('english', ${tableToSearch.title}), 'A') @@ to_tsquery('english', ${searchItem})`
      : and(
          sql`setweight(to_tsvector('english', ${tableToSearch.title}), 'A') @@ to_tsquery('english', ${searchItem})`,
          eq(tableToSearch.isPublished, true)
        );
  return db
    .select({
      id: tableToSearch.id,
      title: tableToSearch.title,
      rankCd: sql`ts_rank_cd(${matchQuery(tableToSearch.title, searchItem)})`,
    })
    .from(tableToSearch)
    .where(whereClause)
    .orderBy((t) => desc(t.rankCd))
    .limit(SEARCH_TITLE_LIMIT);
}
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

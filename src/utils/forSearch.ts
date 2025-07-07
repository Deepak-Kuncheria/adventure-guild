import { SEARCH_TITLE_LIMIT } from "@/constants/search/queryLimit";
import {
  searchTableEnum,
  SearchTableEnumValue,
} from "@/constants/search/searchTableEnum";
import { db } from "@/db";
import { books, chapters, volumes } from "@/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { PgColumn } from "drizzle-orm/pg-core";
import { UUIDTypes } from "uuid";

export const matchQuery = (tableColumn: PgColumn, searchItem: string) => {
  return sql`${tableColumn}, to_tsquery('english', ${searchItem})`;
};

export async function searchInTable(
  tableToSearch: typeof books | typeof chapters | typeof volumes,
  isAuthor: boolean,
  searchItem: string,
  table: SearchTableEnumValue,
  searchLimit: number = SEARCH_TITLE_LIMIT
): Promise<
  {
    id: string | UUIDTypes;
    title: string | null;
    rankCd: number;
    bookId: string;
  }[]
> {
  // split the search item to create multi word prefix matching
  const tokens = searchItem.trim().split(" ");
  const query = tokens.map((token) => token + ":*").join("&");

  const whereClause =
    isAuthor || !("isPublished" in tableToSearch)
      ? sql`${tableToSearch.titleSearch} @@ to_tsquery('english', ${query})`
      : and(
          sql`${tableToSearch.titleSearch} @@ to_tsquery('english', ${query})`,
          eq(tableToSearch.isPublished, true)
        );

  return db
    .select({
      id: tableToSearch.id,
      title: tableToSearch.title,
      rankCd: sql<number>`ts_rank_cd(${matchQuery(
        tableToSearch.titleSearch,
        query
      )})`,
      bookId:
        table === searchTableEnum.BOOKS
          ? tableToSearch.id
          : (tableToSearch as typeof volumes | typeof chapters).bookId,
    })
    .from(tableToSearch)
    .where(whereClause)
    .orderBy((t) => desc(t.rankCd))
    .limit(searchLimit);
}

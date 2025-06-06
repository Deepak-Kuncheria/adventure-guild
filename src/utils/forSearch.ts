import { sql } from "drizzle-orm";
import { PgColumn } from "drizzle-orm/pg-core";

export const matchQuery = (tableColumn: PgColumn, searchItem: string) => {
  return sql`(
  setweight(to_tsvector('english', ${tableColumn}), 'A')
), to_tsquery('english', ${searchItem})`;
};

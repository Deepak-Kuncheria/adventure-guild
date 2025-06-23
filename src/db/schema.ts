import { sql, SQL, relations } from "drizzle-orm";

import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
  AnyPgColumn,
  uniqueIndex,
  pgEnum,
  index,
  customType,
} from "drizzle-orm/pg-core";

const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

// First, define the enum
export const userRoleEnum = pgEnum("user_role", ["reader", "author"]);
export const USER_ROLE_CONSTANT = {
  READER: "reader",
  AUTHOR: "author",
};
// custom lower function
function lower(email: AnyPgColumn): SQL {
  return sql`lower(${email})`;
}
// Users Table
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    username: varchar("username", { length: 100 }),
    userRole: userRoleEnum("user_role").default("reader"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    uniqueIndex("emailUniqueIndex").on(lower(table.email)),
    index("username_idx").on(table.username),
    index("userRole_idx").on(table.userRole),
  ]
);

// Books Table
export const books = pgTable(
  "books",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description"),
    coverImageUrl: text("cover_image_url"),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    isPublished: boolean("is_published").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    titleSearch: tsvector("title_search")
      .notNull()
      .generatedAlwaysAs(
        (): SQL => sql`to_tsvector('english', ${books.title})`
      ),
  },
  (table) => [
    index("book_title_idx").on(table.title),
    index("book_isPublish_idx").on(table.isPublished),
    index("book_title_isPublish_idx").on(table.isPublished, table.title),
    index("search_book_title_idx").using("gin", table.titleSearch),
  ]
);

// Volumes Table
export const volumes = pgTable(
  "volumes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    title: text("title"),
    volumeNumber: integer("volume_number").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    titleSearch: tsvector("title_search")
      .notNull()
      .generatedAlwaysAs(
        (): SQL => sql`to_tsvector('english', ${volumes.title})`
      ),
  },
  (table) => [
    index("volume_title_idx").on(table.title),
    index("volume_bookId_idx").on(table.bookId),
    index("volume_title_bookId_idx").on(table.bookId, table.title),
    index("search_volume_title_idx").using("gin", table.titleSearch),
  ]
);

// Chapters Table
export const chapters = pgTable(
  "chapters",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    volumeId: uuid("volume_id")
      .notNull()
      .references(() => volumes.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    content: text("content").notNull(),
    chapterNumber: integer("chapter_number").notNull(),
    isPublished: boolean("is_published").default(false),
    publishDate: timestamp("publish_date"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    titleSearch: tsvector("title_search")
      .notNull()
      .generatedAlwaysAs(
        (): SQL => sql`to_tsvector('english', ${chapters.title})`
      ),
    contentSearch: tsvector("content_search")
      .notNull()
      .generatedAlwaysAs(
        (): SQL => sql`to_tsvector('english', ${chapters.content})`
      ),
  },
  (table) => [
    index("chapter_title_idx").on(table.title),
    index("chapter_bookId_idx").on(table.bookId),
    index("chapter_number_idx").on(table.chapterNumber),
    index("chapter_isPublish_idx").on(table.isPublished),
    index("chapter_publishDate_idx").on(table.publishDate),
    index("chapter_title_bookId_idx").on(table.bookId, table.title),
    index("chapter_volumeId_title_idx").on(table.volumeId, table.title),
    index("chapter_all_idx").on(
      table.bookId,
      table.volumeId,
      table.isPublished,
      table.publishDate,
      table.title
    ),
    index("search_chapter_title_idx").using("gin", table.titleSearch),
    index("search_chapter_content_idx").using("gin", table.contentSearch),
  ]
);

// Notices Table
export const notices = pgTable(
  "notices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    isPublished: boolean("is_published").default(false),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("notice_isPublish_idx").on(table.isPublished),
    index("notice_title_idx").on(table.title),
    index("notice_createdAt_idx").on(table.createdAt),
  ]
);

// Refresh token table
export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Users relations
export const usersRelations = relations(users, ({ many }) => ({
  books: many(books),
  refreshTokens: many(refreshTokens),
}));

// Books relations
export const booksRelations = relations(books, ({ one, many }) => ({
  author: one(users, {
    fields: [books.authorId],
    references: [users.id],
  }),
  volumes: many(volumes),
  chapters: many(chapters),
}));

// Volumes relations
export const volumesRelations = relations(volumes, ({ one, many }) => ({
  book: one(books, {
    fields: [volumes.bookId],
    references: [books.id],
  }),
  chapters: many(chapters),
}));

// Chapters relations
export const chaptersRelations = relations(chapters, ({ one }) => ({
  book: one(books, {
    fields: [chapters.bookId],
    references: [books.id],
  }),
  volume: one(volumes, {
    fields: [chapters.volumeId],
    references: [volumes.id],
  }),
}));

export const refreshTokenRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

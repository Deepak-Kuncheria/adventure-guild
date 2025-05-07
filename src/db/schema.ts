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
} from "drizzle-orm/pg-core";

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
  (table) => [uniqueIndex("emailUniqueIndex").on(lower(table.email))]
);

// Books Table
export const books = pgTable("books", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  coverImageUrl: text("cover_image_url"),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id),
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Volumes Table
export const volumes = pgTable("volumes", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookId: uuid("book_id")
    .notNull()
    .references(() => books.id),
  title: text("title"),
  volumeNumber: integer("volume_number").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chapters Table
export const chapters = pgTable("chapters", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookId: uuid("book_id")
    .notNull()
    .references(() => books.id),
  volumeId: uuid("volume_id")
    .notNull()
    .references(() => volumes.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  chapterNumber: integer("chapter_number").notNull(),
  isPublished: boolean("is_published").default(false),
  publishDate: timestamp("publish_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notices Table
export const notices = pgTable("notices", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Refresh token table
export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
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

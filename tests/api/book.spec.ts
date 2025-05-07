import { db } from "@/db";
import { books, users } from "@/db/schema";
import { test, expect } from "@playwright/test";
import { eq } from "drizzle-orm";
import { generateAccessToken } from "@/utils/forAuthTokens";
import { UUIDTypes } from "uuid";

test.describe("Testing books api", async () => {
  test.describe.configure({ mode: "serial" });
  let testUserId: { id: UUIDTypes }[];
  let validToken: string;
  let reader: { id: UUIDTypes };
  test.beforeAll(async () => {
    testUserId = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, process.env.TEST_ADMIN as string));

    validToken = generateAccessToken(testUserId[0].id);
    [reader] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.userRole, "reader"))
      .limit(1);
  });
  test("Get all published books for non-author roled users", async ({
    request,
  }) => {
    const res = await request.get(`/api/books`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.books)).toBe(true);
    for (const book of body.books) {
      expect(book.isPublished).toBe(true);
    }
  });
  test("Get all books for Author user", async ({ request }) => {
    const res = await request.get("/api/books", {
      headers: {
        Authorization: `Bearer ${validToken}`,
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.books)).toBe(true);
  });
  test.describe("POST books API", () => {
    test("Create a new book by author", async ({ request }) => {
      const example = {
        title:
          "dummy title.............................................w232....",
        description:
          "lorem impsum lorem lorem impsum lorem lorem impsum loremlorem impsum loremlorem impsum loremlorem impsum loremlorem impsum loremlorem impsum lorem",
      };
      const res = await request.post("/api/books", {
        headers: {
          Authorization: `Bearer ${validToken}`,
        },
        data: example,
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.data.title).toBe(example.title);
      expect(body.data.description).toBe(example.description);
      await db.delete(books).where(eq(books.id, body.data.id));
    });
    test("Return 400 when title is missing paramter", async ({ request }) => {
      const example = {
        description:
          "lorem impsum lorem lorem impsum lorem lorem impsum loremlorem impsum loremlorem impsum loremlorem impsum loremlorem impsum loremlorem impsum lorem",
      };
      const res = await request.post("/api/books", {
        headers: {
          Authorization: `Bearer ${validToken}`,
        },
        data: example,
      });
      expect(res.status()).toBe(400);
    });
    test("Return 401 when access token is invalid", async ({ request }) => {
      const invalidToken = generateAccessToken("");
      const example = {
        title:
          "dummy title.............................................w232....",
        description:
          "lorem impsum lorem lorem impsum lorem lorem impsum loremlorem impsum loremlorem impsum loremlorem impsum loremlorem impsum loremlorem impsum lorem",
      };
      const res = await request.post("/api/books", {
        headers: {
          Authorization: `Bearer ${invalidToken}`,
        },
        data: example,
      });
      expect(res.status()).toBe(401);
    });
    test("Return 403 when book is inserted by non-author user", async ({
      request,
    }) => {
      const invalidToken = generateAccessToken(reader?.id);
      const example = {
        title:
          "dummy title.............................................w232....",
        description:
          "lorem impsum lorem lorem impsum lorem lorem impsum loremlorem impsum loremlorem impsum loremlorem impsum loremlorem impsum loremlorem impsum lorem",
      };
      const res = await request.post("/api/books", {
        headers: {
          Authorization: `Bearer ${invalidToken}`,
        },
        data: example,
      });
      expect(res.status()).toBe(403);
    });
  });
  test.describe("Books API with bookId as param", () => {
    let newBook: { id: string }[];

    test.beforeAll(async () => {
      newBook = await db
        .insert(books)
        .values({
          title: "insert a new book ",
          description: "lorem ipsum",
          coverImageUrl: "",
          authorId: testUserId[0].id as string,
        })
        .returning({ id: books.id });
    });
    test.describe("PATCH books API", () => {
      test("Return 405 when bookId param is missing", async ({ request }) => {
        const res = await request.patch(`/api/books`);
        expect(res.status()).toBe(405);
      });
      test("Return 400 when bookId param is empty", async ({ request }) => {
        const res = await request.patch(`/api/books/null`);
        expect(res.status()).toBe(400);
      });
      test("Return 401 when access token is invalid", async ({ request }) => {
        const invalidToken = generateAccessToken("");
        const res = await request.patch(`/api/books/${newBook[0]?.id}`, {
          headers: {
            Authorization: `Bearer ${invalidToken}`,
          },
          data: {
            title: "access token invalid",
          },
        });
        expect(res.status()).toBe(401);
      });
      test("Return 403 when non-author user updates a book", async ({
        request,
      }) => {
        const invalidToken = generateAccessToken(reader?.id);
        const res = await request.patch(`/api/books/${newBook[0]?.id}`, {
          headers: {
            Authorization: `Bearer ${invalidToken}`,
          },
          data: {
            title: "update book",
          },
        });
        expect(res.status()).toBe(403);
      });
      test("Return 200 with updated book details by author", async ({
        request,
      }) => {
        const example = {
          title: "update book by author",
          description: "updated",
        };
        const res = await request.patch(`/api/books/${newBook[0]?.id}`, {
          headers: {
            Authorization: `Bearer ${validToken}`,
          },
          data: example,
        });
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.data.title).toBe(example.title);
        expect(body.data.description).toBe(example.description);
      });
    });
    test.describe("DELETE books API", () => {
      test("Return 405 when bookId param is missing", async ({ request }) => {
        const res = await request.delete(`/api/books`);
        expect(res.status()).toBe(405);
      });
      test("Return 400 when bookId param is empty", async ({ request }) => {
        const res = await request.delete(`/api/books/${null}`, {
          headers: {
            Authorization: `Bearer ${validToken}`,
          },
        });
        expect(res.status()).toBe(400);
      });
      test("Return 401 when access token is invalid", async ({ request }) => {
        const invalidToken = generateAccessToken("");
        const res = await request.delete(`/api/books/${newBook[0]?.id}`, {
          headers: {
            Authorization: `Bearer ${invalidToken}`,
          },
        });
        expect(res.status()).toBe(401);
      });
      test("Return 403 when non-author user deletes a book", async ({
        request,
      }) => {
        const invalidToken = generateAccessToken(reader?.id);
        const res = await request.delete(`/api/books/${newBook[0]?.id}`, {
          headers: {
            Authorization: `Bearer ${invalidToken}`,
          },
        });
        expect(res.status()).toBe(403);
      });
      test("Return 200 with updated book title by author", async ({
        request,
      }) => {
        const res = await request.delete(`/api/books/${newBook[0]?.id}`, {
          headers: {
            Authorization: `Bearer ${validToken}`,
          },
        });
        expect(res.status()).toBe(200);

        const deletedBook = await db
          .select()
          .from(books)
          .where(eq(books.id, newBook[0]?.id));
        expect(deletedBook.length).toBe(0);
      });
    });
  });
});

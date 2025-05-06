import { db } from "@/db";
import { books, users } from "@/db/schema";
import { test, expect } from "@playwright/test";
import { eq } from "drizzle-orm";
import { generateAccessToken } from "@/utils/forAuthTokens";

test.describe("Testing books api", async () => {
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
    const testUserId = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, process.env.TEST_ADMIN as string));

    const accessToken = generateAccessToken(testUserId[0].id);
    const res = await request.get("/api/books", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.books)).toBe(true);
  });
  test.describe("POST books api", () => {
    let validToken: string;
    test.beforeAll(async () => {
      const testUserId = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, process.env.TEST_ADMIN as string));

      validToken = generateAccessToken(testUserId[0].id);
    });
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
  });
});

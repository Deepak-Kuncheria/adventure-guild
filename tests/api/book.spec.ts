import { db } from "@/db";
import { users } from "@/db/schema";
import { test, expect } from "@playwright/test";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";
// import { TESTER_MAILINATOR } from "@/constants/tests/testUsers";
import { generateAccessToken } from "@/utils/forAuthTokens";
dotenv.config({ path: ".env" });

test.describe("Testing books api", async () => {
  //   let apiContext;
  //   test.beforeAll(async () => {
  //     const testUserId = await db
  //       .select({ id: users.id })
  //       .from(users)
  //       .where(eq(users.email, TESTER_MAILINATOR));
  //     test.fail(
  //       testUserId.length === 0,
  //       `${TESTER_MAILINATOR} was not found in users.`
  //     );
  //     const accessToken = generateAccessToken(testUserId[0].id);
  //     apiContext = await request.newContext({
  //       extraHTTPHeaders: {
  //         Authorization: `Bearer ${accessToken}`,
  //       },
  //     });
  //   });
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
      .where(eq(users.email, "deepaktk98@gmail.com"));

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
});

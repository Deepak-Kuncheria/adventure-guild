import { test, expect } from "@playwright/test";
import { db } from "@/db";
import { refreshTokens, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import cookieLabels from "@/constants/cookieLabels";
import { generateRefreshToken } from "@/utils/forAuthTokens";

const dummyUser = {
  email: "logouttest@mailinator.com",
  password: "Pasoiwo8457*",
  username: "Logout User",
};

test.describe("Logout", () => {
  let refreshToken: string;
  let cookieHeader: string;

  test.beforeAll(async () => {
    // Insert user if not exists
    const [user] =
      (await db.select().from(users).where(eq(users.email, dummyUser.email))) ??
      [];

    const userId =
      user?.id ??
      (
        await db
          .insert(users)
          .values({
            email: dummyUser.email,
            password: dummyUser.password, // assume hashed in real use
            username: dummyUser.username,
          })
          .returning()
      )[0].id;

    // Create refresh token manually
    refreshToken = generateRefreshToken(userId);

    await db.insert(refreshTokens).values({
      token: refreshToken,
      userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // Format cookie header
    cookieHeader = `${cookieLabels.FOR_REFRESH_TOKEN}=${refreshToken}; HttpOnly; Path=/`;
  });

  test("Logout success - token deleted", async ({ request }) => {
    const res = await request.delete("/api/logout", {
      headers: {
        cookie: cookieHeader,
      },
    });

    expect(res.status()).toBe(200);
    const tokens = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.token, refreshToken));
    expect(tokens.length).toBe(0);
  });

  test("Logout - no token present", async ({ request }) => {
    const res = await request.delete("/api/logout");
    expect(res.status()).toBe(200); // Still returns success even without token
  });

  test.afterAll(async () => {
    await db.delete(refreshTokens).where(eq(refreshTokens.token, refreshToken));
    await db.delete(users).where(eq(users.email, dummyUser.email));
  });
});

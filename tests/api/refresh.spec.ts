import { test, expect } from "@playwright/test";
import jwt from "jsonwebtoken";
import { db } from "@/db";
import { refreshTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateRefreshToken } from "@/utils/forAuthTokens";
import cookieLabels from "@/constants/cookieLabels";

const testUserId = "c68e6c17-f120-4320-b749-1d74b08f7245";

test.describe("Test /api/refresh", () => {
  test.describe.configure({ mode: "serial" });
  let validToken: string;

  test.beforeEach(async () => {
    // Create a valid refresh token
    validToken = generateRefreshToken(testUserId);

    // Insert into DB
    await db.insert(refreshTokens).values({
      token: validToken,
      userId: testUserId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    });
  });

  test.afterEach(async () => {
    // Clean up the token
    await db.delete(refreshTokens).where(eq(refreshTokens.userId, testUserId));
  });

  test("returns new access token on success", async ({ request }) => {
    const res = await request.post("/api/refresh", {
      headers: {
        cookie: `${cookieLabels.FOR_REFRESH_TOKEN}=${validToken}`,
      },
    });

    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty("data");
  });

  test("returns 401 if cookie is missing", async ({ request }) => {
    const res = await request.post("/api/refresh");
    expect(res.status()).toBe(401);
  });

  test("returns 403 if token is invalid", async ({ request }) => {
    const invalidToken = "this.is.invalid";
    const res = await request.post("/api/refresh", {
      headers: {
        cookie: `${cookieLabels.FOR_REFRESH_TOKEN}=${invalidToken}`,
      },
    });
    expect(res.status()).toBe(403);
  });

  test("returns 403 if token not found in DB", async ({ request }) => {
    // valid token that is NOT inserted into DB
    const rogueToken = jwt.sign(
      { userId: "rogue-user" },
      process.env.REFRESH_SECRET as string,
      {
        expiresIn: "1h",
      }
    );

    const res = await request.post("/api/refresh", {
      headers: {
        cookie: `${cookieLabels.FOR_REFRESH_TOKEN}=${rogueToken}`,
      },
    });

    expect(res.status()).toBe(403);
  });
});

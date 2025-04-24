import { db } from "@/db";
import { refreshTokens, users } from "@/db/schema";
import { test, expect } from "@playwright/test";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });
test.describe("Sign up", () => {
  test.describe.configure({ mode: "serial" });
  test("Sign up success", async ({ request }) => {
    const email = "hunter@mailinator.com";
    const res = await request.post("/api/sign-up", {
      data: {
        email,
        password: "Password@123",
        username: "fake hunter",
      },
    });
    expect(res.ok()).toBeTruthy();
    const [user] = await db.select().from(users).where(eq(users.email, email));

    await db.delete(refreshTokens).where(eq(refreshTokens.userId, user.id));
    await db.delete(users).where(eq(users.id, user.id));
  });
  test("email missing", async ({ request }) => {
    const email = "";
    const res = await request.post("/api/sign-up", {
      data: {
        email,
        password: "Password@123",
        username: "fake hunter",
      },
    });
    expect(res.status()).toBe(400);
  });
  test("password missing", async ({ request }) => {
    const email = "hunter@123";
    const res = await request.post("/api/sign-up", {
      data: {
        email,
        password: "",
        username: "fake hunter",
      },
    });
    expect(res.status()).toBe(400);
  });
  test("account exists", async ({ request }) => {
    const res = await request.post("/api/sign-up", {
      data: {
        email: "deepaktk98@gmail.com",
        password: "password",
        username: "fake hunter",
      },
    });
    expect(res.status()).toBe(409);
  });
});

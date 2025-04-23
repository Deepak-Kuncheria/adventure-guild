import { db } from "@/db";
import { refreshTokens, users } from "@/db/schema";
import { test, expect } from "@playwright/test";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });
test.describe("Login", () => {
  test("Success", async ({ request }) => {
    const email = "tester@mailinator.com";
    const res = await request.post("/api/login", {
      data: {
        email,
        password: "Password@123",
      },
    });
    expect(res.ok()).toBeTruthy();
    const [user] = await db.select().from(users).where(eq(users.email, email));
    await db.delete(refreshTokens).where(eq(refreshTokens.userId, user.id));
  });
  test("email missing", async ({ request }) => {
    const email = "";
    const res = await request.post("/api/login", {
      data: {
        email,
        password: "Password@123",
      },
    });
    expect(res.status()).toBe(400);
  });
  test("password missing", async ({ request }) => {
    const email = "tester@mailinator.com";
    const res = await request.post("/api/login", {
      data: {
        email,
        password: "",
      },
    });
    expect(res.status()).toBe(400);
  });
  test("account does not exists", async ({ request }) => {
    const res = await request.post("/api/login", {
      data: {
        email: "teste@malssk.com",
        password: "password",
      },
    });
    expect(res.status()).toBe(401);
  });
  test("Password does not match", async ({ request }) => {
    const email = "tester@mailinator.com";
    const res = await request.post("/api/login", {
      data: {
        email,
        password: "Password",
      },
    });
    expect(res.status()).toBe(401);
  });
});

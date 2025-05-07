import { db } from "@/db";
import { refreshTokens, users } from "@/db/schema";
import { test, expect } from "@playwright/test";
import { eq } from "drizzle-orm";

test.describe("Test /api/login", () => {
  test.describe.configure({ mode: "serial" });
  test("Success", async ({ request }) => {
    const email = process.env.TESTER_MAILINATOR as string;
    const res = await request.post("/api/login", {
      data: {
        email,
        password: "Password@123",
      },
    });
    expect(res.ok()).toBeTruthy();
    const setCookie = res.headers()["set-cookie"];
    expect(setCookie).toContain("refreshToken");
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
    const email = process.env.TESTER_MAILINATOR;
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
    const email = process.env.TESTER_MAILINATOR;
    const res = await request.post("/api/login", {
      data: {
        email,
        password: "Password",
      },
    });
    expect(res.status()).toBe(401);
  });
});

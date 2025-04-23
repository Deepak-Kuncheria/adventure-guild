import { test, expect, type Page } from "@playwright/test";

test.describe("Sign up", () => {
  test("Sign up success", async ({ request }) => {
    const res = await request.post("/api/sign-up", {
      data: {
        email: "hunter@mailinator.com",
        password: "Password@123",
        username: "fake hunter",
      },
    });
    expect(res.ok()).toBeTruthy();
  });
});

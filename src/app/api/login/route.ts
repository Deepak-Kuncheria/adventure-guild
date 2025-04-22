import { db } from "@/db";
import { users, refreshTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response("Email and password are required", { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (existingUser.length === 0) {
      return new Response("This account doesn't exist", { status: 401 });
    }

    // Hash the password
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser[0].password
    );
    if (!isPasswordValid) {
      return new Response("Invalid password", { status: 401 });
    }
    // Generate tokens
    const accessToken = jwt.sign(
      { userId: existingUser[0].id },
      process.env.ACCESS_SECRET as string,
      {
        expiresIn: "15m",
      }
    );

    const refreshToken = jwt.sign(
      { userId: existingUser[0].id },
      process.env.REFRESH_SECRET as string,
      {
        expiresIn: "7d",
      }
    );

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Save refresh token
    await db.insert(refreshTokens).values({
      userId: existingUser[0].id,
      token: refreshToken,
      expiresAt,
    });

    // Set refresh token in HTTP-only cookie
    (await cookies()).set({
      name: "refreshToken",
      value: refreshToken,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return Response.json({ accessToken });
  } catch (error) {
    console.error(error);
    return new Response("Server error", { status: 500 });
  }
}

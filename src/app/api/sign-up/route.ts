import { db } from "@/db";
import { users, refreshTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import errorMessages from "@/constants/errorMessages";

export async function POST(req: Request) {
  try {
    const { email, password, username } = await req.json();

    if (!email || !password) {
      return new Response(errorMessages.EMAIL_PASSWORD_REQ, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (existingUser.length > 0) {
      return new Response(errorMessages.ACCOUNT_EXISTS, { status: 409 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({ email, password: hashedPassword, username })
      .returning();

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: newUser.id },
      process.env.ACCESS_SECRET as string,
      {
        expiresIn: "15m",
      }
    );

    const refreshToken = jwt.sign(
      { userId: newUser.id },
      process.env.REFRESH_SECRET as string,
      {
        expiresIn: "7d",
      }
    );

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Save refresh token
    await db.insert(refreshTokens).values({
      userId: newUser.id,
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
    return new Response(errorMessages.SERVER_ERROR, { status: 500 });
  }
}

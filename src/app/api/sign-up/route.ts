import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

import {
  generateAccessToken,
  generateRefreshToken,
  insertAndSetRT,
} from "@/utils/forAuthTokens";
import {
  EMAIL_PASSWORD_REQ,
  ACCOUNT_EXISTS,
} from "@/constants/errors/authErrors";
import { SERVER_ERROR } from "@/constants/errors/commonErrors";

export async function POST(req: Request) {
  try {
    const { email, password, username } = await req.json();

    if (!email || !password) {
      return Response.json({ error: EMAIL_PASSWORD_REQ }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (existingUser.length > 0) {
      return Response.json({ error: ACCOUNT_EXISTS }, { status: 409 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({ email, password: hashedPassword, username })
      .returning();

    // Generate tokens
    const accessToken = generateAccessToken(newUser.id);

    const refreshToken = generateRefreshToken(newUser.id);

    await insertAndSetRT(newUser.id, refreshToken);

    return Response.json({ data: accessToken }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: SERVER_ERROR }, { status: 500 });
  }
}

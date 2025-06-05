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
  ACCOUNT_DOES_NOT_EXIST,
  PASSWORD_NOT_MATCH,
} from "@/constants/errors/authErrors";
import { SERVER_ERROR } from "@/constants/errors/commonErrors";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json({ error: EMAIL_PASSWORD_REQ }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (existingUser.length === 0) {
      return Response.json(
        { error: ACCOUNT_DOES_NOT_EXIST },
        {
          status: 401,
        }
      );
    }

    // Hash the password
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser[0].password
    );
    if (!isPasswordValid) {
      return Response.json({ error: PASSWORD_NOT_MATCH }, { status: 401 });
    }
    // Generate tokens
    const accessToken = generateAccessToken(existingUser[0].id);

    const refreshToken = generateRefreshToken(existingUser[0].id);

    await insertAndSetRT(existingUser[0].id, refreshToken);

    return Response.json({ data: accessToken }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: SERVER_ERROR }, { status: 500 });
  }
}

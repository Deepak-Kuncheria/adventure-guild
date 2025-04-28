import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import errorMessages from "@/constants/errorMessages";
import {
  generateAccessToken,
  generateRefreshToken,
  insertAndSetRT,
} from "@/utils/forAuthTokens";

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
    const accessToken = generateAccessToken(newUser.id);

    const refreshToken = generateRefreshToken(newUser.id);

    await insertAndSetRT(newUser.id, refreshToken);

    return Response.json({ accessToken });
  } catch (error) {
    console.error(error);
    return new Response(errorMessages.SERVER_ERROR, { status: 500 });
  }
}

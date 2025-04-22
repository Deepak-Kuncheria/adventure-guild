import cookieLabels from "@/constants/cookieLabels";
import errorMessages from "@/constants/errorMessages";
import { db } from "@/db";
import { refreshTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import jwt, { JwtPayload } from "jsonwebtoken";
import { generateAccessToken } from "@/utils/forAuthTokens";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(cookieLabels.FOR_REFRESH_TOKEN);

    if (!refreshToken) {
      return new Response(errorMessages.REFRESH_TOKEN_NOT_FOUND, {
        status: 401,
      });
    }
    let payload: JwtPayload;
    try {
      payload = jwt.verify(
        refreshToken.value,
        process.env.REFRESH_SECRET as string
      ) as JwtPayload;
    } catch (err) {
      // log error???
      console.error(err);
      return new Response(errorMessages.INVALID_REFRESH_TOKEN, { status: 403 });
    }
    const [dbToken] = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.token, refreshToken.value));
    if (!dbToken) {
      return new Response(errorMessages.REFRESH_TOKEN_NOT_FOUND, {
        status: 403,
      });
    }
    const accessToken = generateAccessToken(payload.userId);
    return Response.json({ accessToken });
  } catch (err) {
    console.error(err);
    return new Response(errorMessages.SERVER_ERROR, { status: 500 });
  }
}

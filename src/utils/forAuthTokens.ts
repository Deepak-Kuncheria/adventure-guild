import cookieLabels from "@/constants/cookieLabels";
import { db } from "@/db";
import { refreshTokens } from "@/db/schema";
import jwt from "jsonwebtoken";
import { cookies, headers } from "next/headers";
export const generateAccessToken = (id: string) => {
  return jwt.sign({ userId: id }, process.env.ACCESS_SECRET as string, {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (id: string) => {
  return jwt.sign({ userId: id }, process.env.REFRESH_SECRET as string, {
    expiresIn: "7d",
  });
};

// The generated refresh token should be inserted to database and also
// as a http cookie
export const insertAndSetRT = async (id: string, refreshToken: string) => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Save refresh token
  await db.insert(refreshTokens).values({
    userId: id,
    token: refreshToken,
    expiresAt,
  });

  // Set refresh token in HTTP-only cookie
  (await cookies()).set({
    name: cookieLabels.FOR_REFRESH_TOKEN,
    value: refreshToken,
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
};

// function to decode access token from request headers
export const decodeAccessTokenForAPI = async () => {
  const authorization = (await headers()).get("Authorization");
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return null;
  }
  const accessToken = authorization.split(" ")[1];
  try {
    return jwt.verify(accessToken, process.env.ACCESS_SECRET as string) as {
      userId: string;
    };
  } catch (err) {
    console.error(err);
    return null;
  }
};

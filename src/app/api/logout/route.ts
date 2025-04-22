import errorMessages from "@/constants/errorMessages";
import successMessages from "@/constants/successMessages";
import { db } from "@/db";
import { refreshTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken");

    if (refreshToken) {
      await db
        .delete(refreshTokens)
        .where(eq(refreshTokens.token, refreshToken.value));

      cookieStore.set({
        name: "refreshToken",
        value: "",
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        expires: new Date(0), // expired
        path: "/",
      });
    }
    return new Response(successMessages.LOG_OUT, { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(errorMessages.SERVER_ERROR, { status: 500 });
  }
}

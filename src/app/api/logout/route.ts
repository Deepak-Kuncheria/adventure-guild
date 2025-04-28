import cookieLabels from "@/constants/cookieLabels";
import errorMessages from "@/constants/errorMessages";
import successMessages from "@/constants/successMessages";
import { db } from "@/db";
import { refreshTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(cookieLabels.FOR_REFRESH_TOKEN);

    if (refreshToken) {
      await db
        .delete(refreshTokens)
        .where(eq(refreshTokens.token, refreshToken.value));

      cookieStore.delete(cookieLabels.FOR_REFRESH_TOKEN);
    }
    return new Response(successMessages.LOG_OUT, { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(errorMessages.SERVER_ERROR, { status: 500 });
  }
}

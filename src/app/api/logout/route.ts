import cookieLabels from "@/constants/cookieLabels";
import { SERVER_ERROR } from "@/constants/errors/commonErrors";
import { LOG_OUT } from "@/constants/sucess/authSuccess";

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
    return Response.json({ data: LOG_OUT }, { status: 200 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: SERVER_ERROR }, { status: 500 });
  }
}

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// get user role from user id
export const getUserRoleById = async (id: string) => {
  try {
    const user = await db
      .select({ userRole: users.userRole })
      .from(users)
      .where(eq(users.id, id));
    if (user.length > 1) {
      return null;
    }
    return user[0].userRole;
  } catch {
    return null;
  }
};

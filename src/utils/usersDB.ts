import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// get user role from user id
export const getUserRoleById = async (id: string) => {
  return await db
    .select({ userRole: users.userRole })
    .from(users)
    .where(eq(users.id, id));
};

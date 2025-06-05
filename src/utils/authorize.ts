import { ACCESS_DENIED } from "@/constants/errors/authErrors";
import { decodeAccessTokenForAPI } from "./forAuthTokens";
import { getUserRoleById } from "./usersDB";
import { USER_ROLE_CONSTANT } from "@/db/schema";

// find whether user has  author role from the access token sent via
// api headers
export const checkAuthorRole = async (): Promise<
  { status: true; userId: string } | { status: false; response: Response }
> => {
  const decodedToken = await decodeAccessTokenForAPI();
  if (!decodedToken) {
    return {
      status: false,
      response: Response.json({ error: ACCESS_DENIED }, { status: 401 }),
    };
  }
  const role = await getUserRoleById(decodedToken.userId);
  if (role !== USER_ROLE_CONSTANT.AUTHOR) {
    return {
      status: false,
      response: Response.json({ error: ACCESS_DENIED }, { status: 403 }),
    };
  }
  return {
    status: true,
    userId: decodedToken.userId,
  };
};

import { Timestamp } from "next/dist/server/lib/cache-handlers/types";

export function isValidTimestamp(x: string | Date | Timestamp) {
  try {
    const convert = new Date(x);
    return !isNaN(convert.getDate());
  } catch (error) {
    console.error(error);
    return false;
  }
}

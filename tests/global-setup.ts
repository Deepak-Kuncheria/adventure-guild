import dotenv from "dotenv";
export default async function GlobalSetup() {
  dotenv.config({ path: ".env.local" });
}

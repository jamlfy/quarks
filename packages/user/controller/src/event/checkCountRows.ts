import type { RenewSessionPayload } from "@quarks/user-data";
import type { EventPayload } from "@quarks/event";
import type { Env } from "@quarks/share-domain";
import { UserService } from "@quarks/user-data";
import { drizzle } from 'drizzle-orm/d1';

export const type = '0 0 * * 0';

let cachedDb: ReturnType<typeof drizzle> | null = null;

export const handle = async (
  event: EventPayload<RenewSessionPayload>,
  env: Env
): Promise<void> => {
  if (!cachedDb) cachedDb = drizzle(env.DB);
  const userService = new UserService(cachedDb);
  const totalRecords = await userService.count();

  let targetLength = '6';
  if (totalRecords >= 100_000) targetLength = '7';
  if (totalRecords >= 5_000_000) targetLength = '8';

  await env.CACHE.put(`config:ID_LENGTH`, targetLength);
}

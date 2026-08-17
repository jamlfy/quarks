import type { EventPayload } from "@quarks/event";
import type { Env } from "@quarks/share-domain";
import { UserService } from "@quarks/user-data";
import { drizzle } from 'drizzle-orm/d1';

export const type = '0 0 * * 0';

let cachedService: UserService | null = null;

export const handle = async (
  event: EventPayload<void>,
  env: Env
): Promise<void> => {
  if (!cachedService) cachedService = new UserService(drizzle(env.DB));
  const totalRecords = await cachedService.count();

  let targetLength = '6';
  if (totalRecords >= 100_000) targetLength = '7';
  if (totalRecords >= 5_000_000) targetLength = '8';

  await env.CACHE.put(`config:ID_LENGTH`, targetLength);
};

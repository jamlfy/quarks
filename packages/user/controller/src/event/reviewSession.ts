import type { RenewSessionPayload } from '@quarks/user-data';
import type { EventPayload } from '@quarks/event';
import type { Env } from '@quarks/share-domain';

export const type = 'USER_RENEWED_SESSION';

export const handle = async (
  event: EventPayload<RenewSessionPayload>,
  env: Env,
): Promise<void> => {
  const { userId, exp, timestamp } = event.payload;
  const key = `session:${userId}`;

  if (timestamp >= exp) {
    await env.CACHE.delete(key);
    return;
  }

  const remainingTtl = Math.max(1, Math.floor(exp - timestamp));
  const cachedTimesStr = await env.CACHE.get(key);
  const currentTimes = cachedTimesStr ? parseInt(cachedTimesStr, 10) : 0;
  const nextTimes = currentTimes + 1;

  await env.CACHE.put(key, nextTimes.toString(), {
    expirationTtl: remainingTtl,
  });
};

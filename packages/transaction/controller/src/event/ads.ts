import type { EventPayload } from '@quarks/event';
import type { Env } from '@quarks/share-domain';
import { getTransactionService } from '../lib/service';

export const type = 'VIEW_ADS';

export const handle = async (
  event: EventPayload<{ userId: string }>,
  env: Env,
): Promise<void> => {
  const { userId } = event.payload;
  if (!userId) return;

  const transaction = getTransactionService(env);
  const [timesStr, adsStr] = await Promise.all([
    env.CACHE.get(`session:${userId}`),
    env.CACHE.get(`config:ads`),
  ]);

  const times = timesStr ? parseInt(timesStr, 10) : 1;
  const adsMultiplier = adsStr ? parseInt(adsStr, 10) : 1;
  const validTimes = Number.isNaN(times) ? 1 : times;
  const validAdsMultiplier = Number.isNaN(adsMultiplier) ? 1 : adsMultiplier;

  await transaction.add(userId, validTimes * validAdsMultiplier, {
    event: type,
  });
};

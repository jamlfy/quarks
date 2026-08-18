import type { EventPayload } from '@quarks/event';
import type { Env } from '@quarks/share-domain';
import { getTransactionService } from '../lib/service';

export const type = 'NEW_USER';

const DEFAULT_NEW_USER_BONUS = 0;

export const handle = async (
  event: EventPayload<{ userId: string }>,
  env: Env,
): Promise<void> => {
  const { userId } = event.payload;

  if (!userId) return;

  const transaction = getTransactionService(env);
  const rawAmount = await env.CACHE.get(`config:${type}`);
  const parsedAmount = rawAmount
    ? parseInt(rawAmount, 10)
    : DEFAULT_NEW_USER_BONUS;
  const validAmount = Number.isNaN(parsedAmount)
    ? DEFAULT_NEW_USER_BONUS
    : parsedAmount;
  if (validAmount <= 0) return;

  await transaction.add(userId, validAmount, {
    event: type,
  });
};

import type { EventPayload } from '@quarks/event';
import type { Env } from '@quarks/share-domain';
import { getTransactionService } from '../lib/service';

export const type = 'USER_GUEST_OTHER';

const DEFAULT_REFERRAL_BONUS = 0;
const DEFAULT_SESSION_MULTIPLIER = 1;

export const handle = async (
  event: EventPayload<{ userId: string; invite: string }>,
  env: Env,
): Promise<void> => {
  const { userId, invite } = event.payload;

  if (!userId || !invite) return;

  const transaction = getTransactionService(env);

  const [rawAmount, rawTime] = await Promise.all([
    env.CACHE.get(`config:${type}`),
    env.CACHE.get(`session:${invite}`),
  ]);

  const parsedAmount = rawAmount
    ? parseInt(rawAmount, 10)
    : DEFAULT_REFERRAL_BONUS;
  const validAmount = Number.isNaN(parsedAmount)
    ? DEFAULT_REFERRAL_BONUS
    : parsedAmount;

  if (validAmount <= 0) return;

  const parsedTime = rawTime
    ? parseInt(rawTime, 10)
    : DEFAULT_SESSION_MULTIPLIER;
  const validTime =
    Number.isNaN(parsedTime) || parsedTime <= 0
      ? DEFAULT_SESSION_MULTIPLIER
      : parsedTime;

  const recordsToInsert = [
    {
      userId,
      amount: validAmount,
      metadata: { role: 'invited', invitedBy: invite },
    },
    {
      userId: invite,
      amount: validAmount * validTime,
      metadata: { role: 'host', referredUser: userId, multiplier: validTime },
    },
  ];

  await transaction.multiple(recordsToInsert);
};

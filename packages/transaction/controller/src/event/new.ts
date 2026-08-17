import type { EventPayload } from "@quarks/event";
import { TransactionService } from '@quarks/transaction-data';
import { drizzle } from 'drizzle-orm/d1';

export const type = "NEW_USER";

// Monto por defecto si la clave no existe en KV
const DEFAULT_NEW_USER_BONUS = 0;

export const handle = async (
  event: EventPayload<{ userId: string }>,
  env: any
): Promise<void> => {
  const { userId } = event.payload;

  if (!userId) return;

  const transaction = new TransactionService(drizzle(env.DB));
  const rawAmount = await env.CACHE.get(`config:${type}`);
  const parsedAmount = rawAmount ? parseInt(rawAmount, 10) : DEFAULT_NEW_USER_BONUS;
  const validAmount = Number.isNaN(parsedAmount) ? DEFAULT_NEW_USER_BONUS : parsedAmount;
  if (validAmount <= 0) return;

  await transaction.add(userId, validAmount, {
    event: type
  });
};

import { drizzle } from 'drizzle-orm/d1';
import { TransactionService } from '@quarks/transaction-data';
import type { Env } from '@quarks/share-domain';

let cachedService: TransactionService | null = null;

export const getTransactionService = (
  env: Env<unknown>,
): TransactionService => {
  if (!cachedService) cachedService = new TransactionService(drizzle(env.DB));
  return cachedService;
};

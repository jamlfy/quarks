import { createMiddleware } from 'hono/factory';
import { getTransactionService } from './service';

export const injectTransactionService = createMiddleware(async (c, next) => {
  c.set('transactionService' as never, getTransactionService(c.env) as never);
  await next();
});

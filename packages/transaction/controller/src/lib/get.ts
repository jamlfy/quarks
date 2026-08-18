import type { Context } from 'hono';
import type { TransactionService } from '@quarks/transaction-data';

export const getByUser = async (c: Context) => {
  const page = Math.max(1, parseInt(c.req.query('page') || '1'));
  const limit = Math.min(
    Math.max(1, parseInt(c.req.query('limit') || '20')),
    100,
  );

  const storeIdQuery = c.req.query('storeId');
  const domainParam = c.req.param('domain');
  const storeId =
    storeIdQuery || domainParam
      ? String(storeIdQuery || domainParam)
      : undefined;

  const txService = c.get('transactionService') as TransactionService;
  const result = await txService.listByUser(
    c.get('user').id,
    { page, limit },
    storeId,
  );

  return c.json(result);
};

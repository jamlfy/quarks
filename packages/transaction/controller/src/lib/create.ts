import type { Context } from 'hono';
import { validate } from '@quarks/share-function';
import type { StoreService } from '@quarks/store-data';
import type { TransactionService } from '@quarks/transaction-data';
import { PurchaseSchema } from '@quarks/transaction-data';

export const createSpend = async (c: Context) => {
  const domain = c.req.param('domain') ?? '';
  const body = await c.req.json().catch(() => ({}));
  const parsed = validate(PurchaseSchema, body);

  const storeService = c.get('storeService') as StoreService;
  const txService = c.get('transactionService') as TransactionService;

  const store = await storeService.getById(domain);
  if (!store) return c.text('Store not found', 404);

  const totalPoints = parsed.price * (parsed.quantity ?? 1);
  const points = await txService.getByUser(c.get('user').id, domain);
  if (points < totalPoints) return c.text('Insufficient points', 400);

  const tx = await txService.spend(
    c.get('user').id,
    domain,
    totalPoints,
    parsed as unknown as Record<string, unknown>
  );

  await c.env.EVENT_QUEUE.send({
      type: 'CHECKOUT_CART',
      payload: {
          checkout: parsed,
      }
  });

  return c.json({
    success: true,
    transactionId: tx.id ?? '',
    pointsUsed: totalPoints,
    remainingPoints: points - totalPoints,
  }, 201);
};

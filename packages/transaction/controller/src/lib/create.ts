import type { Context } from 'hono';
import { validate } from '@quarks/share-function';
import { StoreService } from "@quarks/store-data";
import { TransactionService, PurchaseSchema } from "@quarks/transaction-data";

export const createSpend = async (c: Context) => {
  const user = c.get('user');
  if (!user?.id) return c.text('Unauthorized', 401);

  const domain = c.req.param('domain') ?? '';
  const body = await c.req.json().catch(() => ({}));
  const parsed = validate(PurchaseSchema, body);

  const storeService = new StoreService(c.get('db'));
  const txService = new TransactionService(c.get('db'));

  const store = await storeService.getById(domain);
  if (!store) return c.text('Store not found', 404);

  const totalPoints = parsed.price * (parsed.quantity ?? 1);
  const points = await txService.getByUser(user.id, domain);
  if (points < totalPoints) return c.text('Insufficient points', 400);

  const tx = await txService.spend(
    user.id,
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

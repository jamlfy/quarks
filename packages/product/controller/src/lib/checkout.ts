import type { Context } from 'hono';
import { ProductService, type IProduct } from "@quarks/product-data";
import { TransactionService } from "@quarks/transaction-data";
import { Getway } from '@quarks/getway';

export const checkout = async (c: Context) => {
  const user = c.get('user');
  if (!user?.id) return c.text('Unauthorized', 403);

  const system = c.req.param('system') ?? '';
  const id = c.req.param('id') ?? '';
  if (!system || !id) return c.text('Product not found', 404);

  const db = c.get('db');
  const service = new ProductService(db);
  const trans = new TransactionService(db);

  const list = (await service.check({ [id]: [user.id] })) as unknown as IProduct[];
  if (!list || list.length === 0) return c.text('Product not found or unavailable', 404);

  const transaction = await trans.gateway(list, user);
  const checkoutResult = await Getway(system, transaction, user);

  return c.json({ checkout: checkoutResult }, 201);
};

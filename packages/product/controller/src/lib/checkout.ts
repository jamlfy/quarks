import type { Context } from 'hono';
import type { ProductService, IProduct } from "@quarks/product-data";
import type { TransactionService } from "@quarks/transaction-data";
import { Getway } from '@quarks/getway';

export const checkout = async (c: Context) => {
  const system = c.req.param('system') ?? '';
  const id = c.req.param('id') ?? '';
  if (!system || !id) return c.text('Product not found', 404);

  const service = c.get('productService') as ProductService;
  const trans = c.get('transactionService') as TransactionService;

  const list = await service.check({ [id]: [c.get('user').id] });
  if (!list || list.length === 0) return c.text('Product not found or unavailable', 404);

  const transaction = await trans.gateway(list as unknown as IProduct[], c.get('user'));
  const checkoutResult = await Getway(system, transaction, c.get('user'));

  return c.json({ checkout: checkoutResult }, 201);
};

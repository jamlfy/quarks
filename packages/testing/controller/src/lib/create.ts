import type { Context } from 'hono';
import { generateHexId } from '@quarks/share-function';

import { TestingService } from '@quarks/testing-data';
import { ProductService, type IProduct } from '@quarks/product-data';
import { TransactionService } from '@quarks/transaction-data';
import { Getway } from '@quarks/getway';

export const create = async (c: Context) => {
  const user = c.get('user');
  if (!user?.id) return c.text('Unauthorized', 403);

  const system = c.req.param('system') ?? '';
  if (!system) return c.text('Product not found', 404);

  const body = await c.req.json().catch(() => ({}));
  const db = c.get('db');

  const service = new TestingService(db);
  const product = new ProductService(db);
  const trans = new TransactionService(db);
  const campaing = `${body.panel}:${generateHexId()}`;

  const checkP = (body.product ?? []).reduce(
    (acc: Record<string, string[]>, { connector, id }: any) => {
      const current = acc[connector] ?? [];
      return {
        ...acc,
        [connector]: [...current, `${id}:${campaing}`],
      };
    },
    { [body.panel]: campaing }
  );

  const [itemsToCheck] = await Promise.all([
    product.check(checkP),
    service.create(user.id, body.product ?? []),
  ]);

  const transaction = await trans.gateway(itemsToCheck as unknown as IProduct[], user, body.campaing);
  const checkout = await Getway(system, transaction, user);

  return c.json({ checkP, checkout }, 201);
};

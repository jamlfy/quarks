import type { Context } from 'hono';
import { generateHexId } from '@quarks/share-function';
import type { TestingService } from '@quarks/testing-data';
import type { ProductService, IProduct } from '@quarks/product-data';
import type { TransactionService } from '@quarks/transaction-data';
import { Getway } from '@quarks/getway';

export const create = async (c: Context) => {
  const system = c.req.param('system') ?? '';
  if (!system) return c.text('Product not found', 404);

  const body = await c.req.json().catch(() => ({}));

  const service = c.get('testingService') as TestingService;
  const product = c.get('productService') as ProductService;
  const trans = c.get('transactionService') as TransactionService;
  const campaing = `${body.panel}:${generateHexId()}`;

  const checkP = (body.product ?? []).reduce(
    (acc: Record<string, string[]>, { connector, id }: any) => {
      const current = acc[connector] ?? [];
      return {
        ...acc,
        [connector]: [...current, `${id}:${campaing}`],
      };
    },
    { [body.panel]: campaing },
  );

  const [itemsToCheck] = await Promise.all([
    product.check(checkP),
    service.create(c.get('user').id, body.product ?? []),
  ]);

  const transaction = await trans.gateway(
    itemsToCheck as unknown as IProduct[],
    c.get('user'),
    body.campaing,
  );
  const checkout = await Getway(system, transaction, c.get('user'));

  return c.json({ checkP, checkout }, 201);
};

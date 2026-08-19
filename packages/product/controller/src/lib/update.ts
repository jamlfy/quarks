import type { Context } from 'hono';
import { validate } from '@quarks/share-function';
import { ProductUpdateSchema } from '@quarks/product-data';
import type { ProductService } from '@quarks/product-data';

export const update = async (c: Context) => {
  const id = c.req.param('id') ?? '';
  const body = await c.req.json().catch(() => ({}));
  const parsed = validate(ProductUpdateSchema, body);

  const service = c.get('productService') as ProductService;
  const result = await service.update(id, parsed);
  await c.env.EVENT_QUEUE.send({ type: 'PRODUCT_UPDATE', payload: data });

  return c.json({ success: true, result });
};

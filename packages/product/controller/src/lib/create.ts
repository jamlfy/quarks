import type { Context } from 'hono';
import { ProductSchema } from '@quarks/product-data';
import type { ProductService } from '@quarks/product-data';
import { validate } from '@quarks/share-function';

export const create = async (c: Context) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = validate(ProductSchema, body);

  const service = c.get('productService') as ProductService;

  const existing = await service.getById(parsed.id);
  if (existing) return c.text('Product already exists', 409);

  const data = await service.create(parsed);

  await c.env.EVENT_QUEUE.send({ type: 'PRODUCT_UPDATE', payload: data });

  return c.json({ success: true, data }, 201);
};

import type { Context } from 'hono';
import { ProductService, ProductSchema } from "@quarks/product-data";
import { validate } from "@quarks/share-function";

export const create =async (c: Context) => {
  const user = c.get('user');
  if (!user?.isAdmin) return c.text('Unauthorized', 403);

  const body = await c.req.json().catch(() => ({}));
  const parsed = validate(ProductSchema, body);

  const service = new ProductService(c.get('db'));

  const existing = await service.getById(parsed.id);
  if (existing) return c.text('Product already exists', 409);

  const data = await service.create(parsed);
  return c.json({ success: true, data }, 201);
};

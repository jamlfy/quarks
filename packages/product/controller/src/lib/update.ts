import type { Context } from 'hono';
import { validate } from "@qquarks/share-function";
import { ProductService, ProductUpdateSchema } from "@quarks/product-data";

export const update = async (c: Context) => {
  const user = c.get('user');
  if (!user?.isAdmin) return c.text('Unauthorized', 403);

  const id = c.req.param('id') ?? '';
  const body = await c.req.json().catch(() => ({}));
  const parsed = validate(ProductUpdateSchema, body);

  const service = new ProductService(c.get('db'));
  const result = await service.update(id, parsed);

  return c.json({ success: true, result });
};

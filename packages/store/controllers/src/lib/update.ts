import type { Context } from 'hono';
import { StoreUpdateSchema } from "@quarks/store-data";
import type { StoreService } from '@quarks/store-data';
import { validate } from '@quarks/share-function';

export const update = async (c: Context) => {
  const domain = c.req.param('domain') ?? '';
  const body = await c.req.json().catch(() => ({}));
  const parsed = validate(StoreUpdateSchema, body);

  const storeService = c.get('storeService') as StoreService;
  const updatedStore = await storeService.update(domain, parsed);

  if (!updatedStore) return c.text('Store not found', 404);

  return c.json(updatedStore);
};

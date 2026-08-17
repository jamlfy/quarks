import type { Context } from 'hono';
import { StoreService } from "@quarks/store-data";

export const getAll = async (c: Context) => {
  const storeService = new StoreService(c.get('db'));
  const stores = await storeService.listActive();
  return c.json(stores);
};

export const getOne =  async (c: Context) => {
  const domain = c.req.param('domain') ?? '';
  const storeService = new StoreService(c.get('db'));
  const store = await storeService.getById(domain);

  if (!store) return c.text('Store not found', 404);

  return c.json(store);
};

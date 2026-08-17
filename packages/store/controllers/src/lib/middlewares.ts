import { createMiddleware } from 'hono/factory';
import { StoreService } from '@quarks/store-data';

export const injectStoreService = createMiddleware(async (c, next) => {
  c.set('storeService' as never, new StoreService(c.get('db')) as never);
  await next();
});

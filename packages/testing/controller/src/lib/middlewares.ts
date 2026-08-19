import { createMiddleware } from 'hono/factory';
import { getTestingService } from './service';

export const injectTestingService = createMiddleware(async (c, next) => {
  c.set('testingService' as never, getTestingService(c.env) as never);
  await next();
});

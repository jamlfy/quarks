import { createMiddleware } from 'hono/factory';
import { UserService } from '@quarks/user-data';

export const injectUserService = createMiddleware(async (c, next) => {
  c.set('userService' as never, new UserService(c.get('db')) as never);
  await next();
});

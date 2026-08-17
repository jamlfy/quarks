import { createMiddleware } from 'hono/factory';
import { UserService } from '@quarks/user-data';
import type { JwtUser } from '@quarks/user-data';

export const injectUserService = createMiddleware(async (c, next) => {
  c.set('userService' as never, new UserService(c.get('db')) as never);
  await next();
});

export const requireAuth = createMiddleware(async (c, next) => {
  const jwtUser = c.get('user') as JwtUser | null;
  if (!jwtUser?.id) return c.text('Unauthorized', 403);
  await next();
});

export const requireAdmin = createMiddleware(async (c, next) => {
  const jwtUser = c.get('user') as JwtUser | null;
  if (!jwtUser?.isAdmin) return c.text('Unauthorized', 403);
  await next();
});

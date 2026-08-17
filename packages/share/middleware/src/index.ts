import { createMiddleware } from 'hono/factory';
import type { JwtUser } from '@quarks/user-data';

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

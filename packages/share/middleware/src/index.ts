import { createMiddleware } from 'hono/factory';
import { verify } from 'hono/jwt';
import { getEnv, ENV, DEFAULTS } from '@quarks/share-const';
import type { Env } from '@quarks/share-domain';
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

export const requireCountry = createMiddleware(async (c, next) => {
  const countryCode =
    c.req.header('X-Country-Code') ?? c.req.header('CF-IPCountry') ?? 'US';
  c.set('countryCode', countryCode);
  await next();
});

export const requireJWT = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization') ?? '';

  try {
    if (!authHeader.startsWith('Bearer ')) {
      throw Error('No token');
    }

    const token = authHeader.substring(7);
    const secret =
      (c.env as Record<string, string>)?.[ENV.JWT_SECRET] ??
      getEnv(undefined, ENV.JWT_SECRET, DEFAULTS.JWT_SECRET);

    const algo =
      (c.env as Record<string, string>)?.[ENV.JWT_ALGO] ??
      getEnv(undefined, ENV.JWT_ALGO, DEFAULTS.JWT_ALGO);

    const payload = await verify(token, secret, algo);

    c.set('user' as any, payload);
  } catch {
    c.set('user', null);
  }

  await next();
});

export function createAppMiddleware(db: unknown) {
  return createMiddleware<Env<typeof db>>(async (c, next) => {
    c.set('db', db);
    await next();
  });
}

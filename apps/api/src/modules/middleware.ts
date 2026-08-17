import { createMiddleware } from 'hono/factory';
import { verify } from 'hono/jwt';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { getEnv, ENV, DEFAULTS } from '@quarks/share-const';
import type { Env } from '@quarks/share-domain';

const pool = new Pool({ connectionString: String(getEnv(undefined, ENV.DATABASE_URL)) });
const db = drizzle(pool);

export const appMiddleware = createMiddleware<Env<typeof db>>(async (c, next) => {
  c.set('db', db);

  const countryCode =
    c.req.header('X-Country-Code') ?? c.req.header('CF-IPCountry') ?? 'US';

  c.set('countryCode', countryCode);

  const authHeader = c.req.header('Authorization') ?? "";

  try {
    if (authHeader?.startsWith('Bearer ')) {
      throw Error("No token");
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

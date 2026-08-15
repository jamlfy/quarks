import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { jwt } from 'hono/jwt';
import { getEnv, ENV, DEFAULTS } from '@quarks/share/const';

const pool = new Pool({ connectionString: String(getEnv(undefined, ENV.DATABASE_URL)) });
const db = drizzle(pool);

export const appMiddleware: MiddlewareHandler = async (c, next) => {
  c.set('db', db);

  const countryCode =
    c.req.header('X-Country-Code') ?? c.req.header('CF-IPCountry') ?? 'US';

  c.set('countryCode', countryCode);

  const authHeader = c.req.header('Authorization');

  if (authHeader?.startsWith('Bearer ')) {
    const secret = c.env?.[ENV.JWT_SECRET] ?? getEnv(undefined, ENV.JWT_SECRET, DEFAULTS.JWT_SECRET);
    const jwtMiddleware = jwt({ secret });

    return jwtMiddleware(c, next);
  }

  await next();
};

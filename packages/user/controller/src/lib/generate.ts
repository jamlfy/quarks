import type { Context } from 'hono';
import { sign } from 'hono/jwt';
import { getEnv, ENV, DEFAULTS } from '@quarks/share-const';
import type { IUser, JwtUser } from "@quarks/user-data";

export const generateToken = (user: IUser | JwtUser, c: Context, nowInSeconds = Math.floor(Date.now() / 1000) ) => {
  const secret =
    (c.env as Record<string, string>)?.[ENV.JWT_SECRET] ??
      getEnv(undefined, ENV.JWT_SECRET, DEFAULTS.JWT_SECRET);

  const algo =
        (c.env as Record<string, string>)?.[ENV.JWT_ALGO] ??
      getEnv(undefined, ENV.JWT_ALGO, DEFAULTS.JWT_ALGO);

  return sign({
    id: user.id as string,
    isAdmin: Boolean(user.isAdmin),
    iat: nowInSeconds,
    exp: nowInSeconds + ( ENV.TWENTY_FOUR_HOURS * 2),
  }, secret, algo);
};

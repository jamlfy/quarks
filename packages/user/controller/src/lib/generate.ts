import type { Context } from 'hono';
import { sign } from 'hono/jwt';
import { getEnv, ENV, DEFAULTS } from '@quarks/share-const';
import type { IUser } from "@quarks/user-data";

export const generateToken = (user: Pick<IUser, 'id' | 'isAdmin'>, c: Context, nowInSeconds = Math.floor(Date.now() / 1000) ) => {
  const secret = getEnv(c.env, ENV.JWT_SECRET, DEFAULTS.JWT_SECRET);
  const algo = getEnv(c.env, ENV.JWT_ALGO, DEFAULTS.JWT_ALGO);

  return sign({
    id: user.id as string,
    isAdmin: Boolean(user.isAdmin),
    iat: nowInSeconds,
    exp: nowInSeconds + ( ENV.TWENTY_FOUR_HOURS * 2),
  }, secret, algo);
};

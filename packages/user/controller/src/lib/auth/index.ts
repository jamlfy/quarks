import type { Context } from 'hono';

import { UserService } from "@quarks/user-data";
import { ENV } from '@quarks/share-const';
import { buildAuthUrl, exchangeCode, SOCIAL_PROVIDERS } from "./service";
import { generateToken } from '../generate';

export const social = (c: Context) => {
    const social = c.req.param('social') ?? '';

    if (!SOCIAL_PROVIDERS.includes(social as any)) {
        return c.text(`Unsupported provider: ${social}. Use: ${SOCIAL_PROVIDERS.join(', ')}`, 400);
    }

    const baseUrl = new URL(c.req.url).origin;
    const callbackUrl = `${baseUrl}/v1/auth/${social}/callback`;
    const authUrl = buildAuthUrl(social, callbackUrl, c.env);

    if (c.req.query('redirect')) {
       return c.redirect(authUrl);
    }

    return c.json({ authUrl });
};

export const socialCallback = async (c: Context) => {
  const social = c.req.param('social') ?? '';

  if (!SOCIAL_PROVIDERS.includes(social as any)) {
    return c.text('Unsupported provider', 400);
  }

  const code = c.req.query('code') || '';
  if (!code) return c.text('Missing code', 400);

  const baseUrl = new URL(c.req.url).origin;
  const callbackUrl = `${baseUrl}/v1/auth/${social}/callback`;

  const userData = await exchangeCode(social, code, callbackUrl, c.env);
  if (!userData) return c.text('Failed to authenticate', 401);

  const userS = new UserService(c.get('db'));
  const cachedLengthStr = await c.env.CACHE.get('config:ID_LENGTH');
  const { user, isNew } = await userS.findOrCreateUser(
    social,
    userData,
    cachedLengthStr ? parseInt(cachedLengthStr, 10) : undefined
  );

  if (isNew) {
      const invite = c.req.query('invite');
      await Promise.all([
          c.env.EVENT_QUEUE.send({ type: 'USER_GUEST_OTHER', payload: { userId: user.id, invite } }),
          c.env.EVENT_QUEUE.send({ type: 'NEW_USER', payload: { userId: user.id } })
      ]);
  }

  const token = await generateToken(user, c);

  const redirect = c.req.query('redirect') || '/';
  c.header('Set-Cookie', `token=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${ENV.TWENTY_FOUR_HOURS * 2}`);
  return c.redirect(`${redirect}`);
};

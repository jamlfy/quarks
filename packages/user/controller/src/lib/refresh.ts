import type { Context } from 'hono';
import { generateToken } from './generate';

export const refresh = async (c: Context) => {
  const user = c.get('user');

  try {
    if (!user) {
      throw new Error('Invalid or corrupted token');
    }

    const nowInSeg = Math.floor(Date.now() / 1000);
    const [newToken] = await Promise.all([
      generateToken(user, c, nowInSeg),
      c.env.EVENT_QUEUE.send({
        type: 'USER_RENEWED_SESSION',
        payload: {
          userId: user.id,
          iat: user.iat,
          exp: user.expire,
          timestamp: nowInSeg,
        },
      }),
    ]);

    return c.json({
      success: true,
      token: newToken,
    });
  } catch {
    return c.json({ error: 'Invalid or corrupted token' }, 401);
  }
};

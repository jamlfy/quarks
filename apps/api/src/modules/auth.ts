import { Hono } from 'hono';
import { social, socialCallback, refresh } from '@quarks/user-controller';

export const authRouter = new Hono();

authRouter.all('/', refresh);
authRouter.all('/:social', social);
authRouter.all('/:social/callback', socialCallback);

import { Hono } from 'hono';
import { getMe, updateMe, getAll, getOne, updateOne, injectUserService, requireAuth, requireAdmin } from '@quarks/user-controller';

export const userRouter = new Hono();

userRouter.use('*', injectUserService);
userRouter.get('/', requireAuth, getMe);
userRouter.put('/', requireAuth, updateMe);

export const userAdminRouter = new Hono();

userAdminRouter.use('*', injectUserService);
userAdminRouter.get('/', requireAdmin, getAll);
userAdminRouter.get('/:id', requireAdmin, getOne);
userAdminRouter.put('/:id', requireAdmin, updateOne);

import { Hono } from 'hono';
import { getMe, updateMe, getAll, getOne, updateOne } from '@quarks/user-controller';

export const userRouter = new Hono();

userRouter.get('/', getMe);
userRouter.put('/', updateMe);
// O .post('/', updateMe) si prefieres mantener POST estricto

export const userAdminRouter = new Hono();

userAdminRouter.get('/', getAll);
userAdminRouter.get('/:id', getOne);
userAdminRouter.put('/:id', updateOne);
// O .post('/:id', updateOne) según la semántica de tu API

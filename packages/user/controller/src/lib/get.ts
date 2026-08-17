import type { Context } from 'hono';
import { UserService } from "@quarks/user-data";

export const getMe = async (c: Context) => {
  const jwtUser = c.get('user');
  if (!jwtUser?.id) return c.text('Unauthorized', 403);

  const userService = new UserService(c.get('db'));
  const user = await userService.getById(jwtUser.id);
  if (!user) return c.text('User not found', 404);

  return c.json(user);
};

export const getOne = async (c: Context) => {
  const jwtUser = c.get('user');
  if (!jwtUser?.isAdmin) return c.text('Unauthorized', 403);

  const id = c.req.param('id') ?? '';

  const userService = new UserService(c.get('db'));
  const user = await userService.getById(id);
  if (!user) return c.text('User not found', 404);

  return c.json(user);
};

export const getAll = async (c: Context) => {
  const jwtUser = c.get('user');
  if (!jwtUser?.isAdmin) return c.text('Unauthorized', 403);

  const page = Math.max(1, parseInt(c.req.query('page') || '1'));
  const limit = Math.min(Math.max(1, parseInt(c.req.query('limit') || '20')), 100);

  const userService = new UserService(c.get('db'));
  const result = await userService.list({ page, limit });

  return c.json(result);
};

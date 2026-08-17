import type { Context } from 'hono';
import type { UserService } from '@quarks/user-data';

export const getMe = async (c: Context) => {
  const userService = c.get('userService') as UserService;
  const user = await userService.getById(c.get('user').id);
  if (!user) return c.text('User not found', 404);
  return c.json(user);
};

export const getOne = async (c: Context) => {
  const userService = c.get('userService') as UserService;
  const user = await userService.getById(c.req.param('id'));
  if (!user) return c.text('User not found', 404);
  return c.json(user);
};

export const getAll = async (c: Context) => {
  const userService = c.get('userService') as UserService;
  const page = Math.max(1, parseInt(c.req.query('page') || '1'));
  const limit = Math.min(Math.max(1, parseInt(c.req.query('limit') || '20')), 100);
  const result = await userService.list({ page, limit });
  return c.json(result);
};

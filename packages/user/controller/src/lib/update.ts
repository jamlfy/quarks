import type { Context } from 'hono';
import { UserService } from "@quarks/user-data";
import { AdminUserUpdateSchema, UserUpdateSchema } from "@quarks/user-data";
import { validate } from '@quarks/share-function';

export const updateOne = async (c: Context) => {
  const jwtUser = c.get('user');
  if (!jwtUser?.isAdmin) return c.text('Unauthorized', 403);

  const id = c.req.param('id') ?? '';
  const body = await c.req.json().catch(() => ({}));
  const parsed = validate(AdminUserUpdateSchema, body);

  const data: Record<string, unknown> = {};
  if (parsed.name !== undefined) data['name'] = parsed.name;
  if (parsed.email !== undefined) data['email'] = parsed.email;

  if (Object.keys(data).length === 0) return c.text('No fields to update', 400);

  const userService = new UserService(c.get('db'));
  const updatedUser = await userService.update(id, data);

  return c.json(updatedUser);
};

export const updateMe = async (c: Context) => {
  const jwtUser = c.get('user');
  if (!jwtUser?.id) return c.text('Unauthorized', 403);

  const body = await c.req.json().catch(() => ({}));
  const parsed = validate(UserUpdateSchema, body);

  const data: Record<string, unknown> = {};
  if (parsed.name !== undefined) data['name'] = parsed.name;
  if (parsed.email !== undefined) data['email'] = parsed.email;

  if (Object.keys(data).length === 0) return c.text('No fields to update', 400);

  const userService = new UserService(c.get('db'));
  const updatedUser = await userService.update(jwtUser.id, data);

  return c.json(updatedUser);
};

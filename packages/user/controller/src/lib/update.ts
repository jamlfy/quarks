import type { Context } from 'hono';
import type { UserService } from '@quarks/user-data';
import type { ZodObject, ZodRawShape } from 'zod';
import { AdminUserUpdateSchema, UserUpdateSchema } from '@quarks/user-data';
import { validate } from '@quarks/share-function';

type UpdateData = Partial<Pick<import('@quarks/user-data').IUser, 'name' | 'email' | 'isAdmin'>>;

function createUpdateHandler(
  schema: ZodObject<ZodRawShape>,
  extractFields: (parsed: Record<string, unknown>) => UpdateData,
  getId: (c: Context) => string
) {
  return async (c: Context) => {
    const body = await c.req.json().catch(() => ({}));
    const parsed = validate(schema, body);
    const data = extractFields(parsed);

    if (Object.keys(data).length === 0) return c.text('No fields to update', 400);

    const userService = c.get('userService') as UserService;
    const updatedUser = await userService.update(getId(c), data);
    return c.json(updatedUser);
  };
}

export const updateMe = createUpdateHandler(UserUpdateSchema, (parsed) => {
  const data: UpdateData = {};
  if (parsed.name !== undefined) data.name = parsed.name;
  if (parsed.email !== undefined) data.email = parsed.email;
  return data;
}, (c) => c.get('user').id);

export const updateOne = createUpdateHandler(AdminUserUpdateSchema, (parsed) => {
  const data: UpdateData = {};
  if (parsed.name !== undefined) data.name = parsed.name;
  if (parsed.email !== undefined) data.email = parsed.email;
  if (parsed.isAdmin !== undefined) data.isAdmin = parsed.isAdmin;
  return data;
}, (c) => c.req.param('id') ?? '');

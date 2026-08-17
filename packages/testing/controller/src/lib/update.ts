import type { Context } from 'hono';
import { TestingService, TestingUpdateSchema } from '@quarks/testing-data';
import { validate } from '@quarks/share-function';

export const update = async (c: Context) => {
  const user = c.get('user');
  if (!user?.isAdmin) return c.text('Unauthorized', 403);

  const domain = c.req.param('domain') ?? '';
  const body = await c.req.json().catch(() => ({}));
  const parsed = validate(TestingUpdateSchema, body);

  if (!domain || !parsed || Object.keys(parsed).length === 0) {
    return c.text('No fields to update', 400);
  }

  const testingService = new TestingService(c.get('db'));
  const data = await testingService.update(domain, parsed);

  return c.json({ success: true, data });
};

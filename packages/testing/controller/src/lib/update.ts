import type { Context } from 'hono';
import { TestingUpdateSchema } from '@quarks/testing-data';
import type { TestingService } from '@quarks/testing-data';
import { validate } from '@quarks/share-function';

export const update = async (c: Context) => {
  const domain = c.req.param('domain') ?? '';
  const body = await c.req.json().catch(() => ({}));
  const parsed = validate(TestingUpdateSchema, body);

  if (!domain || !parsed || Object.keys(parsed).length === 0) {
    return c.text('No fields to update', 400);
  }

  const testingService = c.get('testingService') as TestingService;
  const data = await testingService.update(domain, parsed);

  return c.json({ success: true, data });
};

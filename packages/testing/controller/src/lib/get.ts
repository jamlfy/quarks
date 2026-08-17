import type { Context } from 'hono';
import { TestingService } from '@quarks/testing-data';

export const getAll = async (c: Context) => {
  const user = c.get('user');
  if (!user?.isAdmin) return c.text('Unauthorized', 403);

  const page = Math.max(1, parseInt(c.req.query('page') || '1', 10));
  const limit = Math.min(Math.max(1, parseInt(c.req.query('limit') || '20', 10)), 100);

  const result = await new TestingService(c.get('db')).listActive({ page, limit });
  return c.json(result);
};

export const getByDomain = async (c: Context) => {
  const domain = c.req.param('domain') ?? '';
  const result = await new TestingService(c.get('db')).listByStore(domain);

  return c.json(result);
};

export const getByCampaing = async (c: Context) => {
  const campaing = c.req.param('campaing') ?? '';
  const result = await new TestingService(c.get('db')).getByCampaing(campaing);

  if (!result) return c.text('Campaign not found', 404);

  return c.json(result);
};

export const getOne = async (c: Context) => {
  const id = c.req.param('id') ?? '';
  const result = await new TestingService(c.get('db')).getById(id);

    if (!result) return c.text('Testing item not found', 404);

    if (result.type === 'VIEWS') {
      await c.env.EVENT_QUEUE.send({
          type: 'TESTING_VIEW_SINGLE',
          payload: {
              testingId: result.id,
          }
      });
    }
  return c.json(result);
};

export const getUser = async (c: Context) => {
  const user = c.get('user');
  if (!user?.id) return c.text('Unauthorized', 403);

  const page = Math.max(1, parseInt(c.req.query('page') || '1', 10));
  const limit = Math.min(Math.max(1, parseInt(c.req.query('limit') || '20', 10)), 100);

  const result = await new TestingService(c.get('db')).listByUser(user.id, { page, limit });
  return c.json(result);
};

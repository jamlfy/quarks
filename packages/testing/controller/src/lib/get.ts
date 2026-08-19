import type { Context } from 'hono';
import type { TestingService } from '@quarks/testing-data';

export const getAll = async (c: Context) => {
  const page = Math.max(1, parseInt(c.req.query('page') || '1', 10));
  const limit = Math.min(
    Math.max(1, parseInt(c.req.query('limit') || '20', 10)),
    100,
  );

  const result = await (c.get('testingService') as TestingService).listActive({
    page,
    limit,
  });
  return c.json(result);
};

export const getByDomain = async (c: Context) => {
  const domain = c.req.param('domain') ?? '';
  const result = await (c.get('testingService') as TestingService).listByStore(
    domain,
  );
  return c.json(result);
};

export const getByCampaing = async (c: Context) => {
  const campaing = c.req.param('campaing') ?? '';
  const result = await (
    c.get('testingService') as TestingService
  ).getByCampaing(campaing);

  if (!result) return c.text('Campaign not found', 404);

  return c.json(result);
};

export const getOne = async (c: Context) => {
  const id = c.req.param('id') ?? '';
  const result = await (c.get('testingService') as TestingService).getById(id);

  if (!result) return c.text('Testing item not found', 404);

  if (result.type === 'VIEWS') {
    await c.env.EVENT_QUEUE.send({
      type: 'TESTING_VIEW_SINGLE',
      payload: {
        testingId: result.id,
      },
    });
  }
  return c.json(result);
};

export const getUser = async (c: Context) => {
  const page = Math.max(1, parseInt(c.req.query('page') || '1', 10));
  const limit = Math.min(
    Math.max(1, parseInt(c.req.query('limit') || '20', 10)),
    100,
  );

  const result = await (c.get('testingService') as TestingService).listByUser(
    c.get('user').id,
    { page, limit },
  );
  return c.json(result);
};

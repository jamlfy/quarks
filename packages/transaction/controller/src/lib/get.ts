import type { Context } from 'hono';
import { TransactionService } from '@quarks/transaction-data';

export const getByUser = async (c: Context) => {
    const user = c.get('user');
    if (!user?.id) return c.text('Unauthorized', 403);

    const page = Math.max(1, parseInt(c.req.query('page') || '1'));
    const limit = Math.min(Math.max(1, parseInt(c.req.query('limit') || '20')), 100);

    const storeIdQuery = c.req.query('storeId');
    const domainParam = c.req.param('domain');

    const storeId = storeIdQuery || domainParam ? String(storeIdQuery || domainParam) : undefined;

    const txService = new TransactionService(c.get('db'));
    const result = await txService.listByUser(user.id, { page, limit }, storeId);

    return c.json(result);
};

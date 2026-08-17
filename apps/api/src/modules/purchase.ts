import { Hono } from 'hono';
import { getByUser, createSpend } from '@quarks/transaction-controller';

export const purchaseRouter = new Hono();

purchaseRouter.get('/', getByUser);
purchaseRouter.get('/:domain', getByUser);
purchaseRouter.post('/:domain', createSpend);

import { Hono } from 'hono';
import { getByUser, createSpend, injectTransactionService } from '@quarks/transaction-controller';
import { injectStoreService } from '@quarks/store-controller';
import { requireAuth } from "@quarks/share-middleware";

export const purchaseRouter = new Hono();

purchaseRouter.use('*', injectTransactionService);
purchaseRouter.use('*', injectStoreService);
purchaseRouter.get('/', requireAuth, getByUser);
purchaseRouter.get('/:domain', requireAuth, getByUser);
purchaseRouter.post('/:domain', requireAuth, createSpend);

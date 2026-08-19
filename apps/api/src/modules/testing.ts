import { Hono } from 'hono';
import {
  getAll,
  create,
  getByDomain,
  getByCampaing,
  getUser,
  injectTestingService,
} from '@quarks/testing-controller';
import { injectProductService } from '@quarks/product-controller';
import { injectTransactionService } from '@quarks/transaction-controller';
import { requireAuth, requireAdmin } from '@quarks/share-middleware';

export const testingRouter = new Hono();

testingRouter.use('*', injectTestingService);
testingRouter.get('/', requireAdmin, getAll);
testingRouter.post(
  '/',
  requireAuth,
  injectProductService,
  injectTransactionService,
  create,
);

testingRouter.get('/me', requireAuth, getUser);
testingRouter.get('/:domain', getByDomain);
testingRouter.get('/campaing/:campaing', getByCampaing);

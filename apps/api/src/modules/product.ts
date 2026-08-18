import { Hono } from 'hono';
import {
  getAll,
  getOne,
  create,
  update,
  checkout,
  injectProductService,
} from '@quarks/product-controller';
import { injectTransactionService } from '@quarks/transaction-controller';
import { requireAuth, requireAdmin } from '@quarks/share-middleware';

export const productRouter = new Hono();

productRouter.use('*', injectProductService);
productRouter.get('/', getAll);
productRouter.get('/:id', getOne);
productRouter.all(
  '/:id/:system',
  requireAuth,
  injectTransactionService,
  checkout,
);
productRouter.post('/', requireAdmin, create);
productRouter.put('/:id', requireAdmin, update);

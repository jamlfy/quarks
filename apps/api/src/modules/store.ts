import { Hono } from 'hono';
import {
  getOne,
  getAll,
  create,
  update,
  injectStoreService,
} from '@quarks/store-controller';
import { requireAdmin } from '@quarks/share-middleware';

export const storeRouter = new Hono();

storeRouter.use('*', injectStoreService);
storeRouter.get('/', getAll);
storeRouter.get('/:domain', getOne);
storeRouter.post('/', requireAdmin, create);
storeRouter.put('/:domain', requireAdmin, update);

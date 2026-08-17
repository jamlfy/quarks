import { Hono } from 'hono';
import { getOne, getAll, create, update } from '@quarks/store-controller';

export const storeRouter = new Hono();

storeRouter.get('/', getAll);
storeRouter.get('/:domain', getOne);
storeRouter.post('/', create);
storeRouter.put('/:domain', update);
// O .post('/:domain', update) si mantienes compatibilidad estricta

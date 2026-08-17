import { Hono } from 'hono';
import { getAll, getOne, create, update, checkout } from '@quarks/product-controller';

export const productRouter = new Hono();

productRouter.get('/', getAll);
productRouter.get('/:id', getOne);
productRouter.all('/:id/:system', checkout);

productRouter.post('/', create);
productRouter.put('/:id', update);

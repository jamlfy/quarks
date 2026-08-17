import { Hono } from 'hono';
import { getAll, create, getByDomain, getByCampaing, getUser } from '@quarks/testing-controller';

export const testingRouter = new Hono();

testingRouter.get('/', getAll);
testingRouter.post('/', create);

testingRouter.get('/me', getUser);
testingRouter.get('/:domain', getByDomain);
testingRouter.get('/campaing/:campaing', getByCampaing);

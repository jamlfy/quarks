import { EventBus } from '@quarks/event';
import * as user from '@quarks/user-controller';
import * as testing from '@quarks/testing-controller';
import * as transaction from '@quarks/transaction-controller';
import * as product from '@quarks/product-controller';

export const eventBus = new EventBus();

Object.values(user.event).forEach(eventBus.register);
Object.values(testing.event).forEach(eventBus.register);
Object.values(transaction.event).forEach(eventBus.register);
Object.values(product.event).forEach(eventBus.register);

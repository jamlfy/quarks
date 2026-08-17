import { createMiddleware } from 'hono/factory';
import { ProductService } from '@quarks/product-data';

export const injectProductService = createMiddleware(async (c, next) => {
  c.set('productService' as never, new ProductService(c.get('db')) as never);
  await next();
});

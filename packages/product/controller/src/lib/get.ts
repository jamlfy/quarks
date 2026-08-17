import type { Context } from 'hono';
import type { ProductService } from "@quarks/product-data";

export const getAll = async (c: Context) => {
  const countryCode = c.req.header('x-country-code') || c.get('countryCode') || 'ALL';

  const page = Math.max(1, parseInt(c.req.query('page') || '1'));
  const limit = Math.min(Math.max(1, parseInt(c.req.query('limit') || '20')), 100);

  const service = c.get('productService') as ProductService;
  const result = await service.listByCountry(countryCode, { page, limit });

  return c.json(result);
};

export const getOne = async (c: Context) => {
  const id = c.req.param('id') ?? '';
  const service = c.get('productService') as ProductService;
  const product = await service.getById(id);

  if (!product) return c.text('Product not found', 404);

  await c.env.EVENT_QUEUE.send({
      type: 'PRODUCT_VIEW',
      payload: {
          productId: product.id,
      }
  });

  return c.json(product);
};

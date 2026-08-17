import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import type { PaginatedParams, Paginated } from '@quarks/share-domain';
import { products } from './schema';

export const ProductSchema = createSelectSchema(products, {
  metadata: z.record(z.string(), z.unknown()).optional().nullable(),
}).extend({
  quantity: z.number().int().min(1).optional(),
});

export const ProductCreateSchema = ProductSchema.omit({
  createdAt: true,
  updatedAt: true,
}).partial({
  points: true,
  isActive: true,
  metadata: true,
  quantity: true,
});

export const ProductUpdateSchema = ProductCreateSchema.omit({ id: true }).partial();

export type IProduct = z.infer<typeof ProductSchema>;
export type IProductCreate = z.infer<typeof ProductCreateSchema>;
export type IProductUpdate = z.infer<typeof ProductUpdateSchema>;

export interface IProductService {
  getById(id: string): Promise<IProduct | null>;
  getByCode(code: string): Promise<IProduct | null>;
  list(params: PaginatedParams): Promise<Paginated<IProduct>>;
  listByCountry(countryCode: string, params: PaginatedParams): Promise<Paginated<IProduct>>;
  create(data: IProductCreate): Promise<IProduct>;
  update(id: string, data: IProductUpdate): Promise<IProduct | null>;
  delete(id: string): Promise<boolean>;
  check(ids: Record<string, string[]>): Promise<Array<IProduct & { uuid: string }>>;
}

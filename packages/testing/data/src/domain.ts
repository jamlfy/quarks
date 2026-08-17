import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { testing } from './schema';
import type { PaginatedParams, Paginated } from '@quarks/share-domain';

export const TestingSchema = createSelectSchema(testing, {
  id: z.string().min(1),
  userId: z.string().min(1),
  campaing: z.string().min(1),
  images: z.array(z.string()).default([]),
  name: z.string().min(1),
  description: z.string().min(1),
  sku: z.string().min(1),
  price: z.number().int().min(0),
  metadata: z.record(z.string(), z.unknown()).optional().nullable(),
  countryCode: z.string().min(2),
});

export const TestingInputSchema = z.object({
  campaing: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  sku: z.string().min(1),
  price: z.number().int().min(0),
  type: z.enum(['TIME', 'VIEWS', 'CART', 'PURCHASES']),
  images: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  countryCode: z.string().min(2),
  storeDomains: z.array(z.string()).optional(),
  paymentData: z.record(z.string(), z.unknown()).optional(),
  gateway: z.string().optional(),
});

export const TestingUpdateSchema = TestingSchema.omit({ id: true, userId: true }).partial();

export type ITesting = z.infer<typeof TestingSchema>;
export type ITestingInput = z.infer<typeof TestingInputSchema>;
export type ITestingUpdate = z.infer<typeof TestingUpdateSchema>;

export interface ITestingService {
  listActive(params: PaginatedParams): Promise<Paginated<ITesting>>;
  getById(id: string): Promise<ITesting | null>;
  getByCampaing(campaing: string): Promise<ITesting | null>;
  listByUser(userId: string, params: PaginatedParams): Promise<Paginated<ITesting>>;
  listByStore(domain: string): Promise<ITesting[]>;
  create(userId: string, inputs: ITestingInput[]): Promise<void>;
  update(id: string, input: ITestingUpdate & { isActive?: boolean }): Promise<void>;
  linkStores(testingId: string, domains: string[]): Promise<void>;
}

import { z } from 'zod';
import { StatusError } from './errors';

export function validate<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new StatusError(
      400,
      result.error.issues.map((issue) => issue.message).join('; '),
    );
  }
  return result.data;
}

export const StoreSchema = z.object({
  id: z.string().min(1, 'id is required'),
  name: z.string().min(1, 'name is required'),
  description: z.string().optional(),
  api: z.string().url('api must be a valid URL'),
  mapper: z.record(z.string(), z.string()),
  points: z.string().min(1, 'points formula is required'),
  theme: z.record(z.string(), z.unknown()),
});
export type StoreInput = z.infer<typeof StoreSchema>;

export const StoreUpdateSchema = StoreSchema.omit({ id: true }).partial();
export type StoreUpdateInput = z.infer<typeof StoreUpdateSchema>;

export const PurchaseSchema = z.object({
  productId: z.string().min(1, 'productId is required'),
  productName: z.string().min(1, 'productName is required'),
  price: z.number().int('price must be an integer').min(1, 'price must be >= 1'),
  quantity: z.number().int('quantity must be an integer').min(1).default(1),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export type PurchaseInput = z.infer<typeof PurchaseSchema>;

export const GATEWAY_ENUM = z.enum(['wompi', 'epayco', 'paypal']);

export const ProductSchema = z.object({
  id: z.string().min(1, 'id is required'),
  name: z.string().min(1, 'name is required'),
  code: z.string().min(1, 'code is required'),
  price: z.number().int().nonnegative().optional(),
  currency: z.string().min(1).optional(),
  points: z.number().int().nonnegative().optional(),
  gateway: z.array(GATEWAY_ENUM).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  countryCode: z.string().min(1, 'countryCode is required'),
  isActive: z.boolean().optional(),
});
export type ProductInput = z.infer<typeof ProductSchema>;

export const ProductUpdateSchema = ProductSchema.partial();
export type ProductUpdateInput = z.infer<typeof ProductUpdateSchema>;

export const UserUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email('email must be valid').optional(),
});
export type UserUpdateInput = z.infer<typeof UserUpdateSchema>;

export const AdminUserUpdateSchema = UserUpdateSchema.extend({
  isAdmin: z.boolean().optional(),
});
export type AdminUserUpdateInput = z.infer<typeof AdminUserUpdateSchema>;

export const CheckoutSchema = z.object({
  productId: z.string().min(1, 'productId is required'),
  gateway: GATEWAY_ENUM.optional(),
  paymentData: z.record(z.string(), z.unknown()).optional(),
});
export type CheckoutInput = z.infer<typeof CheckoutSchema>;

export const TestingSchema = z.object({
  campaing: z.string().min(1, 'campaing is required'),
  name: z.string().min(1, 'name is required'),
  description: z.string().min(1, 'description is required'),
  sku: z.string().min(1, 'sku is required'),
  price: z.number().int().min(1, 'price must be >= 1'),
  type: z.enum(['TIME', 'VIEWS', 'CART', 'PURCHASES']),
  images: z.array(z.string()).optional(),
  countryCode: z.string().min(1, 'countryCode is required'),
  storeDomains: z.array(z.string()).optional(),
  gateway: GATEWAY_ENUM.optional(),
  paymentData: z.record(z.string(), z.unknown()).optional(),
});
export type TestingInput = z.infer<typeof TestingSchema>;

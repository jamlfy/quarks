import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import type { PaginatedParams, Paginated } from '@quarks/share-domain';
import type { IProduct } from '@quarks/product-data';
import type { IUser } from '@quarks/user-data';
import { transactions, userPoints } from './schema';

export const TransactionSchema = createSelectSchema(transactions, {
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const TransactionUpdateSchema = TransactionSchema.omit({ id: true }).partial();
export const UserPointsSchema = createSelectSchema(userPoints);
export const PurchaseSchema = z.object({
  price: z.number().int().min(0),
  quantity: z.number().int().min(1).optional(),
});

export type ITransaction = z.infer<typeof TransactionSchema>;
export type ITransactionUpdate = z.infer<typeof TransactionUpdateSchema>;
export type IUserPoints = z.infer<typeof UserPointsSchema>;
export type IPurchase = z.infer<typeof PurchaseSchema>;

export interface ITransactionService {
  add(userId: string, amount: number, metadata: Record<string, unknown>): Promise<ITransaction>;
  findByEvent(gatewayName: string, eventId: string): Promise<ITransaction | undefined>;
  spend(userId: string, storeId: string, amount: number, metadata: Record<string, unknown>): Promise<ITransaction>;
  listByUser(userId: string, params: PaginatedParams, storeId?: string): Promise<Paginated<ITransaction>>;
  getByUser(userId: string, storeId?: string): Promise<number>;
  gateway(cart: IProduct[], user: IUser, needActive?: string | undefined): Promise<ITransaction>;
}

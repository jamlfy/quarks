import { and, count, desc, eq, sql } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import type { PaginatedParams, Paginated } from '@quarks/share-domain';
import type { IUser } from '@quarks/user-data';
import type { IProduct } from '@quarks/product-data';
import type { ITransaction, IUserPoints, ITransactionService } from './domain';
import { transactions, userPoints } from './schema';

export class TransactionService implements ITransactionService {
  constructor(private db: DrizzleD1Database<any>) {}

  private parse(row: any): ITransaction | null {
    if (!row) return null;
    return {
      ...row,
      metadata:
        typeof row.metadata === 'string'
          ? JSON.parse(row.metadata)
          : (row.metadata ?? null),
    };
  }

  async multiple(trans: ITransaction[]): Promise<void> {
    await this.db
      .insert(transactions)
      .values(
        trans.map((e) => ({
          ...e,
          type: 'OK',
          metadata: JSON.stringify(e.metadata),
        })),
      )
      .returning()
      .get();
  }

  async add(
    userId: string,
    amount: number,
    metadata: Record<string, unknown>,
  ): Promise<ITransaction[]> {
    const row = await this.db
      .insert(transactions)
      .values({
        userId,
        type: 'OK',
        amount,
        metadata: JSON.stringify(metadata),
      })
      .returning()
      .get();

    return this.parse(row);
  }

  async spend(
    userId: string,
    storeId: string,
    amount: number,
    metadata: Record<string, unknown>,
  ): Promise<ITransaction[]> {
    const row = await this.db
      .insert(transactions)
      .values({
        userId,
        storeId,
        type: 'OK',
        amount: -1 * amount,
        metadata: JSON.stringify(metadata),
      })
      .returning()
      .get();

    return this.parse(row);
  }

  async listByUser(
    userId: string,
    params: PaginatedParams,
    storeId?: string,
  ): Promise<Paginated<ITransaction>> {
    const offset = (params.page - 1) * params.limit;
    const conditions = [eq(transactions.userId, userId)];

    if (storeId) {
      conditions.push(eq(transactions.storeId, storeId));
    }

    const [totalResult, txns] = await this.db.batch([
      this.db
        .select({ total: count() })
        .from(transactions)
        .where(and(...conditions)),
      this.db
        .select()
        .from(transactions)
        .where(and(...conditions))
        .orderBy(desc(transactions.createdAt))
        .limit(params.limit)
        .offset(offset),
    ]);
    const total = totalResult[0]?.total ?? 0;
    return {
      data: txns.map((t) => this.parse(t)),
      total,
      page: params.page,
      limit: params.limit,
    };
  }

  async getByUser(userId: string, storeId?: string): Promise<number> {
    const conditions = [eq(userPoints.userId, userId)];
    if (storeId) conditions.push(eq(userPoints.storeId, storeId));

    const rows = (await this.db
      .select()
      .from(userPoints)
      .where(and(...conditions))
      .all()) as IUserPoints[];

    if (storeId) return rows[0]?.points ?? 0;

    return rows.reduce((sum, r) => sum + r.points, 0);
  }

  async gateway(
    cart: IProduct[],
    user: IUser,
    needActive?: string | undefined,
  ): Promise<ITransaction> {
    const row = await this.db
      .insert(transactions)
      .values({
        userId: user.id,
        type: 'WAIT',
        amount: cart.reduce((acc, item) => acc + item.points, 0),
        metadata: JSON.stringify({ cart, needActive }),
      })
      .returning()
      .get();

    return this.parse(row);
  }

  async update(
    id: string,
    data: Partial<Pick<ITransaction, 'type' | 'metadata'>>,
  ): Promise<ITransaction[]> {
    const rows = await this.db
      .update(transactions)
      .set(data)
      .where(eq(transactions.id, id))
      .returning()
      .all();
    return rows.map((r) => this.parse(r));
  }
}

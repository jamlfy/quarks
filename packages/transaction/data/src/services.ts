import { and, count, desc, eq, sql } from 'drizzle-orm';
import { DrizzleD1Database } from 'drizzle-orm/d1';
import type { PaginatedParams, Paginated } from '@quarks/share-domain';
import type { IUser } from '@quarks/user-data';
import type { IProduct } from '@quarks/product-data';
import type {
    ITransaction,
    IUserPoints,
    ITransactionService,
} from './domain';
import { transactions, userPoints } from './schema';

export class TransactionService implements ITransactionService {
  constructor(private db: DrizzleD1Database<any>) {}

  private parse(row: any): IProduct | null {
    if (!row) return null;
    return {
      ...row,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata ?? null,
    };
  }

  async multiple(trans:ITransaction[]): Promise<ITransaction> {
    return this.db
      .insert(transactions)
      .values(trans.map((e) => ({ ...e, type: 'OK', metadata: JSON.stringify(e.metadata) })));

  }

  async add(userId: string, amount: number, metadata: Record<string, unknown>): Promise<ITransaction> {
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

  async findByEvent(gatewayName: string, eventId: string): Promise<ITransaction | undefined> {
    const rows = await this.db
      .select()
      .from(transactions)
      .where(
        and(
          sql`json_extract(${transactions.metadata}, '$.gatewayName') = ${gatewayName}`,
          sql`json_extract(${transactions.metadata}, '$.gatewayEventId') = ${eventId}`
        )
      )
      .all();

    return rows[0] ? this.parse(rows[0]) : undefined;
  }

  async spend(userId: string, storeId: string, amount: number, metadata: Record<string, unknown>): Promise<ITransaction> {
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

  async listByUser(userId: string, params: PaginatedParams, storeId?: string): Promise<Paginated<ITransaction>> {
    const offset = (params.page - 1) * params.limit;
    const conditions = [eq(transactions.userId, userId)];

    if (storeId) {
      conditions.push(eq(transactions.storeId, storeId));
    }

    const [[{ total }], txns] = await Promise.all([
      this.db
        .select({ total: count() })
        .from(transactions)
        .where(and(...conditions))
        .all(),
      this.db
        .select()
        .from(transactions)
        .where(and(...conditions))
        .orderBy(desc(transactions.createdAt))
        .limit(params.limit)
        .offset(offset)
        .all()
    ]);

    return {
      data: txns.map((t) => this.parse(t)),
      total,
      page: params.page,
      limit: params.limit
    };
  }

  async getByUser(userId: string, storeId?: string): Promise<number> {
    const conditions = [eq(userPoints.userId, userId)];
    if (storeId) conditions.push(eq(userPoints.storeId, storeId));

    const rows = await this.db
      .select()
      .from(userPoints)
      .where(and(...conditions))
      .all() as IUserPoints[];

    if (storeId) return rows[0]?.points ?? 0;

    return rows.reduce((sum, r) => sum + r.points, 0);
  }

  async gateway(cart: IProduct[], user: IUser, needActive?: string | undefined): Promise<ITransaction> {
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

  async update(id: string, data: Record<string, unknown>): Promise<ITransaction[]> {
    const rows = await this.db.update(transactions).set(data).where(eq(transactions.id, id)).returning().all();
    return rows.map((r) => this.parse(r));
  }
}

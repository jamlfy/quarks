import { desc, eq, and, or, count } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import type { PaginatedParams, Paginated } from '@quarks/share-domain';
import type {
  IProduct,
  IProductService,
  IProductUpdate,
  IProductCreate,
} from './domain';
import { products } from './schema';

export class ProductService implements IProductService {
  constructor(private db: DrizzleD1Database<any>) {}

  private parse(row: any): IProduct | null {
    if (!row) return null;
    return {
      ...row,
      quantity: row.quantity ?? undefined,
      metadata:
        typeof row.metadata === 'string'
          ? JSON.parse(row.metadata)
          : (row.metadata ?? null),
    };
  }

  async getById(id: string): Promise<IProduct | null> {
    const row = await this.db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .get();
    return this.parse(row);
  }

  async getByCode(code: string): Promise<IProduct | null> {
    const row = await this.db
      .select()
      .from(products)
      .where(eq(products.code, code))
      .get();
    return this.parse(row);
  }

  async list(params: PaginatedParams): Promise<Paginated<IProduct>> {
    const offset = (params.page - 1) * params.limit;

    const [totalResult, rows] = await this.db.batch([
      this.db.select({ total: count() }).from(products),
      this.db
        .select()
        .from(products)
        .orderBy(desc(products.createdAt))
        .limit(params.limit)
        .offset(offset),
    ]);

    const total = totalResult[0]?.total ?? 0;

    return {
      data: rows
        .map((r) => this.parse(r))
        .filter((p): p is IProduct => p !== null),
      total,
      page: params.page,
      limit: params.limit,
    };
  }

  async listByCountry(
    countryCode: string,
    params: PaginatedParams,
  ): Promise<Paginated<IProduct>> {
    const offset = (params.page - 1) * params.limit;
    const query = and(
      eq(products.isActive, true),
      or(
        eq(products.countryCode, countryCode),
        eq(products.countryCode, 'ALL'),
      ),
    );

    const [[{ total }], rows] = await Promise.all([
      this.db.select({ total: count() }).from(products).where(query).all(),
      this.db
        .select()
        .from(products)
        .where(query)
        .orderBy(desc(products.createdAt))
        .limit(params.limit)
        .offset(offset)
        .all(),
    ]);

    return {
      data: rows
        .map((r) => this.parse(r))
        .filter((p): p is IProduct => p !== null),
      total,
      page: params.page,
      limit: params.limit,
    };
  }

  async create(input: IProductCreate): Promise<IProduct> {
    const row = await this.db
      .insert(products)
      .values({
        name: input.name,
        code: input.code,
        price: input.price,
        currency: input.currency,
        points: input.points ?? 0,
        gateway: JSON.stringify(input.gateway ?? []),
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        countryCode: input.countryCode,
        isActive: input.isActive ?? true,
      })
      .returning()
      .get();

    return this.parse(row) as IProduct;
  }

  async update(id: string, input: IProductUpdate): Promise<IProduct | null> {
    const payload: Record<string, unknown> = {};

    if (input.name !== undefined) payload['name'] = input.name;
    if (input.code !== undefined) payload['code'] = input.code;
    if (input.price !== undefined) payload['price'] = input.price;
    if (input.currency !== undefined) payload['currency'] = input.currency;
    if (input.points !== undefined) payload['points'] = input.points;
    if (input.metadata !== undefined)
      payload['metadata'] = JSON.stringify(input.metadata);
    if (input.countryCode !== undefined)
      payload['countryCode'] = input.countryCode;
    if (input.isActive !== undefined) payload['isActive'] = input.isActive;

    if (Object.keys(payload).length === 0) {
      return this.getById(id);
    }

    const row = await this.db
      .update(products)
      .set(payload)
      .where(eq(products.id, id))
      .returning()
      .get();

    return this.parse(row);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(products)
      .where(eq(products.id, id))
      .run();
    return result.rowsWritten > 0;
  }

  async check(
    ids: Record<string, string[]>,
  ): Promise<Array<IProduct & { uuid: string }>> {
    const entries = Object.entries(ids);
    if (entries.length === 0) return [];

    const query = entries.map(([productId]) => eq(products.id, productId));
    const rows = await this.db
      .select()
      .from(products)
      .where(or(...query))
      .all();

    return entries.reduce<Array<IProduct & { uuid: string }>>(
      (acc, [productId, units]) => {
        const row = rows.find(({ id }) => id === productId);
        const parsedProduct = this.parse(row);
        const newUnits = units.map((uuid) => ({
          ...parsedProduct,
          uuid,
          quantity: parsedProduct?.quantity ?? 1,
        })) as Array<IProduct & { uuid: string }>;

        return [...acc, ...newUnits];
      },
      [],
    );
  }
}

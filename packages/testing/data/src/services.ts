import { and, desc, eq, count, inArray } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import type { PaginatedParams, Paginated } from '@quarks/share-domain';

import { testing, testingStores } from './schema';
import type { ITesting, ITestingInput, ITestingUpdate } from './domain';

export class TestingService {
  constructor(private db: DrizzleD1Database<any>) {}

  private parse(row: any): ITesting | null {
    if (!row) return null;

    let parsedImages = row.images;
    if (typeof row.images === 'string') {
      try {
        parsedImages = JSON.parse(row.images);
      } catch {
        parsedImages = [];
      }
    }

    return {
      ...row,
      images: Array.isArray(parsedImages) ? parsedImages : [],
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata ?? null,
    };
  }

  async listActive(params: PaginatedParams): Promise<Paginated<ITesting>> {
    const offset = (params.page - 1) * params.limit;
    const condition = eq(testing.isActive, true);

    const [[{ total }], rows] = await Promise.all([
      this.db.select({ total: count() }).from(testing).where(condition).all(),
      this.db
        .select()
        .from(testing)
        .where(condition)
        .orderBy(desc(testing.createdAt))
        .limit(params.limit)
        .offset(offset)
        .all(),
    ]);

    return {
      data: rows.map((r) => this.parse(r)).filter((i): i is ITesting => i !== null),
      total,
      page: params.page,
      limit: params.limit,
    };
  }

  async getById(id: string): Promise<ITesting | null> {
    const row = await this.db.select().from(testing).where(eq(testing.id, id)).get();
    return this.parse(row);
  }

  async getByIds(ids: string[]): Promise<ITesting[]> {
    if (ids.length === 0) return [];

    const rows = this.db.select().from(testing)
      .where(inArray(testing.id, ids))
      .all();

    return rows.map((r) => this.parse(r)).filter((i): i is ITesting => i !== null);
  }

  async getByCampaing(campaing: string): Promise<ITesting | null> {
    const row = await this.db
      .select()
      .from(testing)
      .where(and(eq(testing.campaing, campaing), eq(testing.isActive, true)))
      .get();

    return this.parse(row);
  }

  async listByUser(userId: string, params: PaginatedParams): Promise<Paginated<ITesting>> {
    const offset = (params.page - 1) * params.limit;
    const query = eq(testing.userId, userId);

    const [[{ total }], rows] = await Promise.all([
      this.db.select({ total: count() }).from(testing).where(query).all(),
      this.db
        .select()
        .from(testing)
        .where(query)
        .orderBy(desc(testing.createdAt))
        .limit(params.limit)
        .offset(offset)
        .all(),
    ]);

    return {
      data: rows.map((r) => this.parse(r)).filter((i): i is ITesting => i !== null),
      total,
      page: params.page,
      limit: params.limit,
    };
  }

  async listByStore(domain: string): Promise<ITesting[]> {
    const rows = await this.db
      .select({ item: testing })
      .from(testingStores)
      .innerJoin(testing, eq(testingStores.testingId, testing.id))
      .where(eq(testingStores.storeId, domain))
      .all();

    return rows
      .map((r) => this.parse(r.item))
      .filter((c): c is ITesting => c !== null && Boolean(c.isActive));
  }

  async create(userId: string, inputs: (ITestingInput & { id: string })[]): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.insert(testing).values(
        inputs.map((e) => ({
          userId,
          campaing: e.campaing,
          images: e.images ?? [],
          name: e.name,
          description: e.description,
          sku: e.sku,
          price: e.price,
          type: e.type,
          metadata: e.metadata ? JSON.stringify(e.metadata) : null,
          countryCode: e.countryCode,
          isActive: false,
        }))
      );

      const storeRelations = inputs.reduce<Array<{ testingId: string; storeId: string }>>(
        (acc, item) => {
          const stores = item.storeDomains ?? [];
          const relations = stores.map((storeId) => ({ testingId: item.id, storeId }));
          return [...acc, ...relations];
        },
        []
      );

      if (storeRelations.length > 0) {
        await tx.insert(testingStores).values(storeRelations);
      }
    });
  }

  async update(id: string, input: ITestingUpdate & { isActive?: boolean }): Promise<void> {
    const data: Record<string, unknown> = {};

    if (input['campaing'] !== undefined) data['campaing'] = input['campaing'];
    if (input['images'] !== undefined) data['images'] = input['images'];
    if (input['name'] !== undefined) data['name'] = input['name'];
    if (input['description'] !== undefined) data['description'] = input['description'];
    if (input['sku'] !== undefined) data['sku'] = input['sku'];
    if (input['price'] !== undefined) data['price'] = input['price'];
    if (input['type'] !== undefined) data['type'] = input['type'];
    if (input['metadata'] !== undefined) data['metadata'] = JSON.stringify(input['metadata']);
    if (input['countryCode'] !== undefined) data['countryCode'] = input['countryCode'];
    if (input['isActive'] !== undefined) data['isActive'] = input['isActive'];

    if (Object.keys(data).length === 0) return;

    return this.db.update(testing).set(data).where(eq(testing.id, id));
  }

  async linkStores(testingId: string, domains: string[]): Promise<void> {
    const uniqueDomains = [...new Set(domains)];
    if (uniqueDomains.length === 0) return;

    const values = uniqueDomains.map((domain) => ({ testingId, storeId: domain }));
    await this.db.insert(testingStores).values(values);
  }

  async active(campaing: string): Promise<ITesting[]> {
    return this.db.update(testing).set({ isActive: true }).where(eq(testing.campaing, campaing)).returning().all();
  }

  async desactive(ids: string[]): Promise<ITesting[]> {
    if (ids.length === 0) return [];

    return this.db
      .update(testing)
      .set({ isActive: false })
      .where(inArray(testing.id, ids))
      .returning()
      .all();
  }

  async whoIsActive(): Promise<ITesting[]> {
    return this.db.select().from(testing).where(and(eq(testing.isActive, true), eq(testing.type, "TIME"))).all();
  }
}

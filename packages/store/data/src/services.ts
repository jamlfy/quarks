import { eq } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { stores } from './schema';
import type { IStore, IStoreCreate, IStoreUpdate, IStoreService } from './domain';

export class StoreService implements IStoreService {
  constructor(private db: DrizzleD1Database<any>) {}

  private parse(row: any): IStore | null {
    if (!row) return null;
    return {
      ...row,
      mapper: typeof row.mapper === 'string' ? JSON.parse(row.mapper) : row.mapper ?? {},
      theme: typeof row.theme === 'string' ? JSON.parse(row.theme) : row.theme ?? {},
    };
  }

  async listActive(): Promise<IStore[]> {
    const rows = await this.db
      .select()
      .from(stores)
      .where(eq(stores.isActive, true))
      .all();

    return rows.map((r) => this.parse(r)).filter((s): s is IStore => s !== null);
  }

  async getById(id: string): Promise<IStore | null> {
    const row = await this.db
      .select()
      .from(stores)
      .where(eq(stores.id, id))
      .get();

    return this.parse(row);
  }

  async create(data: IStoreCreate): Promise<IStore> {
    const row = await this.db
      .insert(stores)
      .values({
        ...data,
        description: data.description ?? null,
        mapper: JSON.stringify(data.mapper),
        theme: JSON.stringify(data.theme),
      })
      .returning()
      .get();

    return this.parse(row) as IStore;
  }

  async update(id: string, data: IStoreUpdate): Promise<IStore | null> {
    const payload: Record<string, unknown> = {};

    if (data.name !== undefined) payload['name'] = data.name;
    if (data.description !== undefined) payload['description'] = data.description;
    if (data.api !== undefined) payload['api'] = data.api;
    if (data.points !== undefined) payload['points'] = data.points;
    if (data.isActive !== undefined) payload['isActive'] = data.isActive;
    if (data.mapper !== undefined) payload['mapper'] = JSON.stringify(data.mapper);
    if (data.theme !== undefined) payload['theme'] = JSON.stringify(data.theme);

    if (Object.keys(payload).length === 0) {
      return this.getById(id);
    }

    const row = await this.db
      .update(stores)
      .set(payload)
      .where(eq(stores.id, id))
      .returning()
      .get();

    return this.parse(row);
  }
}

import { and, count, desc, eq } from 'drizzle-orm';
import { generateUUIdUser } from '@quarks/share-function';

import type { DrizzleD1Database } from 'drizzle-orm/d1';
import type { PaginatedParams, Paginated } from '@quarks/share-domain';
import type { IUser } from './domain';

import { users } from './schema';

export class UserService {
  constructor(private db: DrizzleD1Database<any>) {}

  async count() {
    const [{ value: totalRecords }] = await this.db
      .select({ value: count() })
      .from(users);

    return totalRecords;
  }

  getById(id: string) {
    return this.db.select().from(users).where(eq(users.id, id)).get();
  }

  getByEmail(email: string): Promise<IUser | undefined> {
    return this.db.select().from(users).where(eq(users.email, email)).get();
  }

  getBySocial(provider: string, socialId: string): Promise<IUser | undefined> {
    return this.db
      .select()
      .from(users)
      .where(
        and(eq(users.socialProvider, provider), eq(users.socialId, socialId)),
      )
      .get();
  }

  create(
    data: {
      email: string;
      name?: string;
      avatar?: string;
      socialId?: string;
      socialProvider?: string;
    },
    lengChar = 6,
  ): Promise<IUser> {
    return this.db
      .insert(users)
      .values({
        id: generateUUIdUser(lengChar),
        email: data.email,
        name: data.name ?? null,
        avatar: data.avatar ?? null,
        socialId: data.socialId ?? null,
        socialProvider: data.socialProvider ?? null,
      })
      .returning()
      .get();
  }

  async findOrCreateUser(
    provider: string,
    data: Record<string, unknown>,
    idLength?: number,
  ): Promise<{ user: IUser; isNew: boolean }> {
    const socialId = String(
      data['id'] ?? data['sub'] ?? data['email'] ?? crypto.randomUUID(),
    );
    const existing = await this.getBySocial(provider, socialId);
    if (existing) return { user: existing, isNew: false };

    const email = data['email']
      ? String(data['email'])
      : `${socialId}@${provider}.auth`;
    const name = String(
      data['name'] ?? data['login'] ?? data['email'] ?? 'User',
    );
    const avatar = String(
      data['picture'] ?? data['avatar_url'] ?? data['avatar'] ?? '',
    );
    const user = await this.create(
      { email, name, avatar, socialId, socialProvider: provider },
      idLength,
    );
    return { user, isNew: true };
  }

  update(
    id: string,
    data: Partial<Pick<IUser, 'name' | 'email' | 'isAdmin'>>,
  ): Promise<IUser | undefined> {
    return this.db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning()
      .get();
  }

  delete(id: string) {
    return this.db.delete(users).where(eq(users.id, id)).run();
  }

  async list(params: PaginatedParams): Promise<Paginated<IUser[]>> {
    const offset = (params.page - 1) * params.limit;
    const [totalResult, userList] = await this.db.batch([
      this.db.select({ value: count() }).from(users),
      this.db
        .select()
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(params.limit)
        .offset(offset)
        .all(),
    ]);
    const total = totalResult[0]?.total ?? 0;
    return { data: userList, total, page: params.page, limit: params.limit };
  }
}

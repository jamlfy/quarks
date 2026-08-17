import { sqliteTable, text, integer, index, primaryKey } from 'drizzle-orm/sqlite-core';

export const testing = sqliteTable('testing', {
  id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => ({ table: 'users', column: 'id' } as any)),
  campaing: text('campaing').notNull(),
  images: text('image', { mode: 'json' }).notNull(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  sku: text('sku').notNull().unique(),
  price: integer('price').notNull(),
  type: text('type', { enum: ['TIME', 'VIEWS', 'CART', 'PURCHASES'] }).notNull(),
  max: integer('max').notNull(),
  metadata: text('metadata'),
  countryCode: text('country_code').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()).$onUpdateFn(() => new Date()),
}, (table) => [
  index('campaing_idx').on((table as any).campaing),
  index('userId_idx').on((table as any).userId),
  index('user_campaing_idx').on((table as any).userId, (table as any).campaing),
  index('country_active_campaing_idx').on((table as any).countryCode, (table as any).isActive, (table as any).campaing),
]);

export const testingStores = sqliteTable('testing_stores', {
  testingId: text('testing_id').notNull().references(() => ({ table: 'testing', column: 'id' } as any)),
  storeId: text('store_id').notNull().references(() => ({ table: 'stores', column: 'id' } as any)),
}, (table) => [
  primaryKey({ columns: [(table as any).testingId, (table as any).storeId] }),
  index('store_lookup_idx').on((table as any).storeId),
  index('testing_lookup_idx').on((table as any).testingId),
]);

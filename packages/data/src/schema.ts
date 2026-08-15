import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  sqliteView,
  text,
} from 'drizzle-orm/sqlite-core';
import type { GatewayName } from '@quarks/shared';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  avatar: text('avatar'),
  socialId: text('social_id'),
  socialProvider: text('social_provider'),
  isAdmin: integer('is_admin', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const stores = sqliteTable('stores', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  api: text('api').notNull(),
  mapper: text('mapper', { mode: 'json' })
    .$type<Record<string, string>>()
    .notNull(),
  points: text('points').notNull(),
  theme: text('theme', { mode: 'json' })
    .$type<Record<string, unknown>>()
    .notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdBy: text('created_by'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  storeId: text('store_id').references(() => stores.id),
  type: text('type').notNull(),
  amount: integer('amount').notNull(),
  metadata: text('metadata', { mode: 'json' }).$type<Record<string, unknown>>(),
  createdAt: text('created_at').notNull(),
});

export const product = sqliteTable('product', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  price: integer('price'),
  currency: text('currency'),
  points: integer('points'),
  gateway: text('gateway', { mode: 'json' }).$type<GatewayName[]>(),
  metadata: text('metadata', { mode: 'json' }).$type<Record<string, unknown>>(),
  countryCode: text('country_code').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const testing = sqliteTable(
  'testing',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    campaing: text('campaing').notNull(),
    images: text('images', { mode: 'json' }).$type<string[]>(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    sku: text('sku').notNull().unique(),
    price: integer('price').notNull(),
    type: text('type'),
    startAt: text('start_at'),
    endAt: text('end_at'),
    metadata: text('metadata', { mode: 'json' }).$type<Record<string, unknown>>(),
    countryCode: text('country_code').notNull(),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    index('campaing_idx').on(table.campaing),
    index('userId_idx').on(table.userId),
    index('user_campaing_idx').on(table.userId, table.campaing),
    index('country_active_campaing_idx').on(
      table.countryCode,
      table.isActive,
      table.campaing,
    ),
  ],
);

export const testingStores = sqliteTable(
  'testing_stores',
  {
    testingId: text('testing_id')
      .notNull()
      .references(() => testing.id, { onDelete: 'cascade' }),
    storeId: text('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.testingId, table.storeId] }),
    index('store_lookup_idx').on(table.storeId),
    index('testing_lookup_idx').on(table.testingId),
  ],
);

export const userPoints = sqliteView('user_points', {
  userId: text('user_id').notNull(),
  storeId: text('store_id'),
  points: integer('points').notNull(),
});

export const dbSchema = {
  users,
  stores,
  transactions,
  product,
  testing,
  testingStores,
  userPoints,
};

export type DBSchema = typeof dbSchema;
export type UserRow = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
export type StoreRow = typeof stores.$inferSelect;
export type StoreInsert = typeof stores.$inferInsert;
export type TransactionRow = typeof transactions.$inferSelect;
export type TransactionInsert = typeof transactions.$inferInsert;
export type ProductRow = typeof product.$inferSelect;
export type ProductInsert = typeof product.$inferInsert;
export type TestingRow = typeof testing.$inferSelect;
export type TestingInsert = typeof testing.$inferInsert;

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { generateHexId } from '@quarks/share-function';

export const products = sqliteTable('product', {
  id: text('id')
        .primaryKey()
        .$defaultFn(() => generateHexId()),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  price: integer('price').notNull(),
  currency: text('currency').notNull(),
  points: integer('points').notNull().default(0),
  metadata: text('metadata'),
  gateway: text('gateway'),
  countryCode: text('country_code').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()).$onUpdateFn(() => new Date()),
});

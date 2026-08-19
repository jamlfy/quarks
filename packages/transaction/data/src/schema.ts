import { eq, sum, sql } from 'drizzle-orm';
import {
  sqliteTable,
  sqliteView,
  text,
  integer,
} from 'drizzle-orm/sqlite-core';

export const transactions = sqliteTable('transactions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => ({ table: 'users', column: 'id' }) as any),
  storeId: text('store_id').references(
    () => ({ table: 'store', column: 'id' }) as any,
  ),
  type: text('type', { enum: ['WAIT', 'OK', 'FAIL'] }),
  amount: integer('amount').notNull(),
  metadata: text('metadata'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

export const userPoints = sqliteView('user_points', {
  userId: text('user_id').notNull(),
  storeId: text('store_id'),
  points: integer('points').notNull(),
}).as(
  sql`SELECT ${transactions.userId} as user_id, ${transactions.storeId} as store_id, sum(${transactions.amount}) as points
      FROM ${transactions}
      WHERE ${transactions.type} = 'OK'
      GROUP BY ${transactions.userId}, ${transactions.storeId}`
);

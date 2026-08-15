/// <reference types="@cloudflare/workers-types" />

import { describe, expect, it } from 'vitest';
import { getPoints, getPointsByStore, getPointsByUser } from '../points';

interface Captured {
  sql: string;
  params: unknown[];
}

function fakeD1(rows: Array<Record<string, unknown>>) {
  const captured: Captured = { sql: '', params: [] };
  const statement = {
    bind: (...params: unknown[]) => {
      captured.params = params;
      return statement;
    },
    first: async () => rows[0] ?? null,
  };
  const d1 = {
    prepare: (sql: string) => {
      captured.sql = sql;
      return statement;
    },
  };
  return { d1: d1 as unknown as D1Database, captured };
}

describe('points', () => {
  it('returns the balance for a user (global)', async () => {
    const { d1, captured } = fakeD1([{ points: 42 }]);
    const points = await getPointsByUser(d1, 'user-1');
    expect(points).toBe(42);
    expect(captured.sql).toContain('user_points');
    expect(captured.sql).toContain('store_id IS NULL');
    expect(captured.params).toEqual(['user-1']);
  });

  it('returns 0 when the user has no transactions', async () => {
    const { d1 } = fakeD1([]);
    expect(await getPointsByUser(d1, 'user-1')).toBe(0);
  });

  it('returns the balance filtered by store', async () => {
    const { d1, captured } = fakeD1([{ points: 10 }]);
    const points = await getPointsByStore(d1, 'user-1', 'store-1');
    expect(points).toBe(10);
    expect(captured.sql).toContain('store_id = ?2');
    expect(captured.params).toEqual(['user-1', 'store-1']);
  });

  it('delegates storeId to the store query', async () => {
    const { d1, captured } = fakeD1([{ points: 7 }]);
    expect(await getPoints(d1, 'user-1', 'store-1')).toBe(7);
    expect(captured.sql).toContain('store_id = ?2');
    expect(captured.params).toEqual(['user-1', 'store-1']);
  });
});

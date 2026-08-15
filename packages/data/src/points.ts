/// <reference types="@cloudflare/workers-types" />

export interface PointsRow {
  points: number | null;
}

export async function getPointsByUser(d1: D1Database, userId: string): Promise<number> {
  const row = await d1
    .prepare('SELECT points FROM user_points WHERE user_id = ?1 AND store_id IS NULL')
    .bind(userId)
    .first<PointsRow>();
  return row?.points ?? 0;
}

export async function getPointsByStore(
  d1: D1Database,
  userId: string,
  storeId: string,
): Promise<number> {
  const row = await d1
    .prepare('SELECT points FROM user_points WHERE user_id = ?1 AND store_id = ?2')
    .bind(userId, storeId)
    .first<PointsRow>();
  return row?.points ?? 0;
}

export async function getPoints(
  d1: D1Database,
  userId: string,
  storeId?: string,
): Promise<number> {
  if (storeId) {
    return getPointsByStore(d1, userId, storeId);
  }
  return getPointsByUser(d1, userId);
}

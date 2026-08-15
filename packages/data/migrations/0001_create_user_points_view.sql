CREATE VIEW IF NOT EXISTS user_points AS
SELECT user_id, store_id,
  COALESCE(SUM(CASE WHEN type = 'ADD' THEN amount ELSE -amount END), 0) as points
FROM transactions GROUP BY user_id, store_id;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  avatar TEXT,
  social_id TEXT,
  social_provider TEXT,
  is_admin INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS stores (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  api TEXT NOT NULL,
  mapper TEXT NOT NULL,
  points TEXT NOT NULL,
  theme TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id),
  store_id TEXT REFERENCES stores(id),
  type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  metadata TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS product (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  price INTEGER,
  currency TEXT,
  points INTEGER,
  gateway TEXT,
  metadata TEXT,
  country_code TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS testing (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id),
  campaing TEXT NOT NULL,
  images TEXT,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  price INTEGER NOT NULL,
  type TEXT,
  start_at TEXT,
  end_at TEXT,
  metadata TEXT,
  country_code TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS campaing_idx ON testing (campaing);
CREATE INDEX IF NOT EXISTS userId_idx ON testing (user_id);
CREATE INDEX IF NOT EXISTS user_campaing_idx ON testing (user_id, campaing);
CREATE INDEX IF NOT EXISTS country_active_campaing_idx ON testing (country_code, is_active, campaing);

CREATE TABLE IF NOT EXISTS testing_stores (
  testing_id TEXT NOT NULL REFERENCES testing(id) ON DELETE CASCADE,
  store_id TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  PRIMARY KEY (testing_id, store_id)
);

CREATE INDEX IF NOT EXISTS store_lookup_idx ON testing_stores (store_id);
CREATE INDEX IF NOT EXISTS testing_lookup_idx ON testing_stores (testing_id);

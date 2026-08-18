import type { Queue, D1Database, KVNamespace } from '@cloudflare/workers-types';

export interface PaginatedParams {
  page: number;
  limit: number;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export type Env<T> = {
  API_SECRET_KEY: string;
  ENVIRONMENT: 'development' | 'production';
  EVENTS_QUEUE: Queue<Record<string, unknown>>;
  DB: D1Database;
  CACHE: KVNamespace;
  Variables: {
    db: T;
    countryCode: string;
    user?: Record<string, unknown>;
  };
};

import { drizzle } from 'drizzle-orm/d1';
import { TestingService } from '@quarks/testing-data';
import type { Env } from '@quarks/share-domain';

let cachedService: TestingService | null = null;

export const getTestingService = (env: Env<unknown>): TestingService => {
  if (!cachedService) cachedService = new TestingService(drizzle(env.DB));
  return cachedService;
};

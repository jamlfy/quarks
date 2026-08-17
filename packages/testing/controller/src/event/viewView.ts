import type { EventPayload } from "@quarks/event";
import { TestingService } from '@quarks/testing-data';
import { drizzle } from 'drizzle-orm/d1';

export const type = "TESTING_VIEW_SINGLE";

export const handle = async (
  event: EventPayload<{ testingId: string }>,
  env: any
): Promise<void> => {
  const { testingId } = event.payload;
    const key = `testing:${type}:${testingId}`;
    const cachedAmountStr = await env.CACHE.get(key);
    const testS = new TestingService(drizzle(env.DB));

    let currentAmount: number;

    if (cachedAmountStr === null) {
      const testing = await testS.getById(testingId);

      if (!testing) return;

      currentAmount = testing.max;
    } else {
      currentAmount = parseInt(cachedAmountStr, 10);
    }

    if (currentAmount <= 0) {
        await Promise.all([
          testS.desactive([testingId]),
          env.CACHE.delete(key)
        ]);
      return;
    }

    const newAmount = currentAmount - 1;

    await env.CACHE.put(key, newAmount.toString());
};

import type { EventPayload } from "@quarks/event";
import { TestingService } from '@quarks/testing-data';
import { drizzle } from 'drizzle-orm/d1';

export const type = "ADD_CART";

export const handle = async (
  event: EventPayload<{ testingId: string }>,
  env: any
): Promise<void> => {
  const { testingId } = event.payload;
  if (!testingId) return;

  const key = `testing:${type}:${testingId}`;

  const testS = new TestingService(drizzle(env.DB));
  const cachedAmountStr = await env.CACHE.get(key);
  const promises = [];
  let currentAmount: number;

  if (cachedAmountStr === null) {
    const testing = await testS.getById(testingId);

    if (!testing) return;

    currentAmount = testing.max;
  } else {
    currentAmount = parseInt(cachedAmountStr, 10);
  }

    if (currentAmount <= 0) {
        promises.push(testS.desactive([testingId]));
        promises.push(env.CACHE.delete(key));
    } else {
      const newAmount = currentAmount - 1;
      promises.push(env.CACHE.put(key, newAmount.toString()));
    }


  await Promise.all(promises);
};

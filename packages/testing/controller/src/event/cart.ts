import type { EventPayload } from "@quarks/event";
import type { Env } from "@quarks/share-domain";
import { getTestingService } from '../lib/service';

export const type = "ADD_CART";

export const handle = async (
  event: EventPayload<{ testingId: string }>,
  env: Env
): Promise<void> => {
  const { testingId } = event.payload;
  if (!testingId) return;

  const key = `testing:${type}:${testingId}`;

  const testS = getTestingService(env);
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

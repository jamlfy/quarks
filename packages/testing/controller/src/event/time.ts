import type { EventPayload } from "@quarks/event";
import { TestingService } from '@quarks/testing-data';
import { drizzle } from 'drizzle-orm/d1';

export const type = "0 0 * * *";
export const name = "TEST_TIME";

export const handle = async (
  event: EventPayload<void>,
  env: any
): Promise<void> => {
  const testS = new TestingService(drizzle(env.DB));
  const testings = await testS.whoIsActive();

  if (!testings || testings.length === 0) return;

  const kvReadPromises = testings.map((test) => {
    const key = `testing:${name}:${test.id}`;
    return env.CACHE.get(key).then((val) => ({ test, key, val }));
  });

  const kvResults = await Promise.all(kvReadPromises);

  const writePromises: Promise<unknown>[] = [];
  const toDesactive: string[] = [];

  for (const { test, key, val } of kvResults) {
    let currentAmount: number;

    if (val === null) {
      currentAmount = test.max;
    } else {
      currentAmount = parseInt(val, 10);
    }

    if (currentAmount <= 0) {
      toDesactive.push(test.id);
      writePromises.push(env.CACHE.delete(key));
      continue;
    }

    const newAmount = currentAmount - 1;
    writePromises.push(env.CACHE.put(key, newAmount.toString()));
  }

  if (toDesactive.length > 0) {
    writePromises.push(testS.desactive(toDesactive));
  }

  await Promise.all(writePromises);
};

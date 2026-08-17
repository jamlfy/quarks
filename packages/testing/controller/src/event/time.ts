import type { EventPayload } from "@quarks/event";
import type { Env } from "@quarks/share-domain";
import { getTestingService } from '../lib/service';

export const type = "0 0 * * *";
export const name = "TEST_TIME";

export const handle = async (
  event: EventPayload<void>,
  env: Env
): Promise<void> => {
  const testS = getTestingService(env);
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
    writePromises.push(testS.desactive(toDesactive).then(() => undefined));
  }

  await Promise.all(writePromises);
};

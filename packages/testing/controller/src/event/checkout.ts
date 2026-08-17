import type { EventPayload } from "@quarks/event";
import { TestingService, ITesting } from '@quarks/testing-data';
import { drizzle } from 'drizzle-orm/d1';

export const type = "CHECKOUT_CART";

export const handle = async (
  event: EventPayload<{ checkout: ITesting[] }>,
  env: any
): Promise<void> => {
  const { checkout = [] } = event.payload;
  const itemsWithCampaign: ITesting[] = checkout.filter((item) => !!item.campaing);
    if (itemsWithCampaign.length === 0) return;

  const kvReadPromises = itemsWithCampaign.map((item) => {
    const key = `testing:${type}:${item.id}`;
    return env.CACHE.get(key).then((val) => ({ item, key, val }));
  });

  const kvResults = await Promise.all(kvReadPromises);

  const promises: Promise<unknown>[] = [];
  const toDesactive: string[] = [];
  const toFetch: { item: ITesting; key: string }[] = [];

  for (const { item, key, val } of kvResults) {
    if (val === null) {
      toFetch.push({ item, key });
      continue;
    }

    const currentAmount = parseInt(val, 10);

    if (currentAmount <= 0) {
      toDesactive.push(item.id);
      promises.push(env.CACHE.delete(key));
      continue;
    }

    const newAmount = currentAmount - 1;
    promises.push(env.CACHE.put(key, newAmount.toString()));
  }

  if (toFetch.length > 0) {
    promises.concat(toFetch.map(({ item: { max }, key }) => env.CACHE.put(key, max.toString())));
  }

  if (toDesactive.length > 0) {
    const testS = new TestingService(drizzle(env.DB));
    promises.concat(testS.desactive(toDesactive));
  }

  await Promise.all(promises);
};

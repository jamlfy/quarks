import type { EventPayload } from '@quarks/event';
import type { Env } from '@quarks/share-domain';

interface ProductUpdatePayload {
  id: string;
  price: number;
  points: number;
}

export const type = 'PRODUCT_UPDATE';

export const handle = async (
  event: EventPayload<ProductUpdatePayload>,
  env: Env,
): Promise<void> => {
  const { id, price, points } = event.payload;
  const key = `config:${id}`;

  if (price !== 0) return;

  await env.CACHE.put(key, points.toString());
};

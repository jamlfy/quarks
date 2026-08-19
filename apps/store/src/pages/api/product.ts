import type { APIRoute } from 'astro';
import { getStore } from '../../lib/getStore';

export const GET: APIRoute = async ({ request }) => {
  const domain = request.headers.get('host') || '';
  const { store } = await getStore(domain);
  if (!store?.apiUrl) return new Response(null, { status: 404 });

  const cache = (caches as any).default as Cache;
  const cacheKey = new Request(store.apiUrl);
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const resp = await fetch(store.apiUrl);
  if (!resp.ok) return new Response(null, { status: 502 });

  const raw: any[] = await resp.json();
  const items = Array.isArray(raw) ? raw : [];

  const products = items.map((item: any) => {
    const mapped: Record<string, any> = {};
    for (const [appField, storeField] of Object.entries(store.mapper)) {
      mapped[appField] = item[storeField as string];
    }
    return mapped;
  });

  const body = JSON.stringify(products);
  const headers = new Headers({
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=60, s-maxage=60',
  });
  const response = new Response(body, { headers });
  await cache.put(cacheKey, response.clone());
  return response;
};

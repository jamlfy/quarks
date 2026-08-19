import { API_URL } from './env';

function transformStore(raw: any) {
  return {
    ...raw,
    mapper: typeof raw.mapper === 'string' ? JSON.parse(raw.mapper) : raw.mapper,
    theme: typeof raw.theme === 'string' ? JSON.parse(raw.theme) : raw.theme,
    pointsFn: new Function('value', 'return ' + raw.points) as (value: number) => number,
    apiUrl: raw.api,
  };
}

export async function getStore(domain: string) {
  const cacheStorage = typeof caches !== 'undefined' ? (caches as any).default as Cache : null;
  const cacheKey = new Request(`https://cache/store/${domain}`);

  if (cacheStorage) {
    const cached = await cacheStorage.match(cacheKey);
    if (cached) {
      const raw = await cached.json();
      if (!raw) return { store: null };
      return { store: transformStore(raw) };
    }
  }

  try {
    const resp = await fetch(`${API_URL}/v1/store/${domain}`);
    if (!resp.ok) {
      if (cacheStorage) {
        const miss = new Response(JSON.stringify(null), {
          headers: { 'Cache-Control': 'public, max-age=300' },
        });
        await cacheStorage.put(cacheKey, miss);
      }
      return { store: null };
    }
    const raw = await resp.json();
    if (cacheStorage) {
      const body = JSON.stringify(raw);
      const hit = new Response(body, {
        headers: { 'Cache-Control': 'public, max-age=300' },
      });
      await cacheStorage.put(cacheKey, hit.clone());
    }
    return { store: transformStore(raw) };
  } catch {
    return { store: null };
  }
}

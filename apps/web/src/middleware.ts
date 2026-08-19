import { defineMiddleware } from 'astro/middleware';

const PUBLIC_PATHS = ['/', '/products', '/ranking', '/store/', '/product/'];
const USER_PATHS = ['/me', '/purchases', '/cart', '/users/', '/store/new'];

export const onRequest = defineMiddleware(async (context, next) => {
  if (context.request.method !== 'GET') return next();

  const url = new URL(context.request.url);
  const isPublic = PUBLIC_PATHS.some(p => url.pathname === p || url.pathname.startsWith(p));
  const isUserPage = USER_PATHS.some(p => url.pathname === p || url.pathname.startsWith(p));
  if (!isPublic || isUserPage || context.request.headers.get('Authorization')) return next();

  const runtime = (context.locals as any)?.runtime;
  const cacheStorage = runtime?.caches ?? (typeof caches !== 'undefined' ? (caches as any).default : null);
  if (!cacheStorage) return next();
  const cache = cacheStorage.default as Cache;
  const cacheKey = new Request(context.request.url);
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const response = await next();
  if (response.ok) {
    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'public, max-age=60, s-maxage=60');
    const clone = new Response(response.body, { status: response.status, headers });
    await cache.put(cacheKey, clone.clone());
    return clone;
  }
  return response;
});

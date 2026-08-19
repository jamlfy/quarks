import type { APIRoute } from 'astro';
import { API_URL } from '../../lib/env';

export const ALL: APIRoute = async ({ request, params }) => {
  const path = params.path || '';
  const url = new URL(request.url);
  const queryString = url.search;
  const targetUrl = `${API_URL}/${path}${queryString}`;
  const isPublicGet = request.method === 'GET' && !request.headers.get('Authorization');

  if (isPublicGet) {
    const cache = (caches as any).default as Cache;
    const cacheKey = new Request(targetUrl);
    const cached = await cache.match(cacheKey);
    if (cached) return cached;
  }

  const headers = new Headers(request.headers);
  headers.delete('host');

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined,
  });

  const responseHeaders = new Headers(response.headers);
  responseHeaders.set('cache-control', 'public, max-age=60, s-maxage=60');
  responseHeaders.delete('set-cookie');
  responseHeaders.delete('transfer-encoding');

  const body = response.body;

  if (isPublicGet && response.ok) {
    const clone = new Response(body, { status: response.status, headers: responseHeaders });
    const cache = (caches as any).default as Cache;
    await cache.put(new Request(targetUrl), clone.clone());
    return clone;
  }

  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
};

export const GET = ALL;
export const POST = ALL;
export const PUT = ALL;
export const PATCH = ALL;
export const DELETE = ALL;

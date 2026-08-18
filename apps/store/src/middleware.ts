import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const host = context.request.headers.get('host') ?? '';
  const domain = host.split(':')[0];

  context.locals.tenant = domain;

  return next();
});

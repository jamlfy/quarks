import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { ENV } from '@quarks/share-const';

import type { Env } from '@quarks/share-domain';
import type { MessageBatch } from '@cloudflare/workers-types';
import type { ScheduledEvent, ExecutionContext } from '@cloudflare/workers-types';
import type { EventPayload } from '@quarks/event';

import { appMiddleware } from './modules/middleware';
import { authRouter } from './modules/auth';
import { userRouter, userAdminRouter } from './modules/user';
import { storeRouter } from './modules/store';
import { purchaseRouter } from './modules/purchase';
import { productRouter } from './modules/product';
import { testingRouter } from './modules/testing';
import { WebHook } from '@quarks/getway';
import { eventBus } from './modules/events';

const app = new Hono();
const prefix = `/${ENV.API_VERSION}`;

app.use('*', cors());
app.use('*', appMiddleware);

app.route(`${prefix}/auth`, authRouter);
app.route(`${prefix}/store`, storeRouter);
app.route(`${prefix}/purchase`, purchaseRouter);
app.route(`${prefix}/product`, productRouter);
app.route(`${prefix}/testing`, testingRouter);
app.route(`${prefix}/me`, userRouter);
app.route(`${prefix}/user`, userAdminRouter);
app.all(`${prefix}/webhook/*`, WebHook);

// Health Check
app.all('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.onError((err, c) => {
  const status = 'status' in err && typeof err.status === 'number' ? err.status : 500;
  return c.text(err.message || 'Internal Server Error', status as any);
});

app.notFound((c) => c.text('Not Found', 404));

export default {
  fetch: app.fetch,

  async queue(batch: MessageBatch<EventPayload<unknown>>, env: Env, ctx: ExecutionContext): Promise<void> {
      for (const message of batch.messages) {
        try {
            await eventBus.dispatch(message.body, env, ctx);
            message.ack();
          } catch {
            message.retry();
          }
      }
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    await eventBus.dispatch({ type: event.cron, payload: {}, timestamp: new Date().toISOString() }, env, ctx);
  }
}

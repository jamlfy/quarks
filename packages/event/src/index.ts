// domain/events.ts
export interface EventPayload<T = unknown> {
  type: string;
  payload: T;
  timestamp: string;
}

export interface EventHandler<T = unknown> {
  type: string;
  handle(event: EventPayload<T>, env: any, ctx: any): Promise<void>;
}

export class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  register(handler: EventHandler) {
    const existing = this.handlers.get(handler.type) || [];
    this.handlers.set(handler.type, [...existing, handler]);
  }

  async dispatch(event: EventPayload, env: any, ctx: any) {
    const matchedHandlers = this.handlers.get(event.type) || [];
    if (matchedHandlers.length === 0) return;

    const results = await Promise.allSettled(
      matchedHandlers.map((handler) => handler.handle(event, env, ctx))
    );

    const errors = results.filter((r) => r.status === 'rejected');
    if (errors.length > 0) {
      console.error(`Ocurrieron ${errors.length} errores procesando el evento ${event.type}`);
      throw new Error(`Event processing incomplete for ${event.type}`);
    }
  }
}

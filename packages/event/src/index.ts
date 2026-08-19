export interface EventPayload<T = unknown> {
  type: string;
  payload: T;
  timestamp: number;
}

export interface EventHandler<T = unknown, E = Record<string, unknown>> {
  type: string;
  handle(event: EventPayload<T>, env: E): Promise<void>;
}

export class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  register(handler: EventHandler) {
    const existing = this.handlers.get(handler.type) || [];
    this.handlers.set(handler.type, [...existing, handler]);
  }

  async dispatch(event: EventPayload, env: Record<string, unknown>) {
    const matchedHandlers = this.handlers.get(event.type) || [];
    if (matchedHandlers.length === 0) return;

    const results = await Promise.allSettled(
      matchedHandlers.map((handler) => handler.handle(event, env)),
    );

    const errors = results.filter((r) => r.status === 'rejected');
    if (errors.length > 0) {
      console.error(
        `Ocurrieron ${errors.length} errores procesando el evento ${event.type}`,
      );
      throw new Error(`Event processing incomplete for ${event.type}`);
    }
  }
}

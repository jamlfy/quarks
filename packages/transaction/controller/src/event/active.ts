import type { EventPayload } from "@quarks/event";
import type { Env } from "@quarks/share-domain";
import { getTransactionService } from '../lib/service';

export const type = "TRANSACTION_ACTIVE";

export const handle = async (
  event: EventPayload<{ orderId: string }>,
  env: Env
): Promise<void> => {
  const { orderId } = event.payload;
  const transaction = getTransactionService(env);
  const [order] = await transaction.update(orderId, { type: "OK" });
  await env.EVENT_QUEUE.send({
      type: 'TESTING_ACTIVE',
      payload: order
  });
};

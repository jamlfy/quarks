import type { EventPayload } from "@quarks/event";
import { TransactionService } from '@quarks/transaction-data';
import { drizzle } from 'drizzle-orm/d1';

export const type = "TRANSACTION_ACTIVE";

export const handle = async (
  event: EventPayload<{ orderId: string }>,
  env: any
): Promise<void> => {
  const { orderId } = event.payload;
  const transaction = new TransactionService(drizzle(env.DB));
  const [order] = await transaction.update(orderId, { type: "OK" });
  await env.EVENT_QUEUE.send({
      type: 'TESTING_ACTIVE',
      payload: order
  });
};

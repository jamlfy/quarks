import type { EventPayload } from "@quarks/event";
import { TestingService } from '@quarks/testing-data';
import { drizzle } from 'drizzle-orm/d1';

export const type = "TESTING_ACTIVE";

export const handle = async (
  event: EventPayload<{ metadata: { needActive?: string } }>,
  env: any
): Promise<void> => {
    const { metadata: { needActive } } = event.payload;
    const testing = new TestingService(drizzle(env.DB));
    if (needActive) {
        await testing.active(needActive);
    }
};

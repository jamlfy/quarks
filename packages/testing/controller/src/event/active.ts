import type { EventPayload } from '@quarks/event';
import type { Env } from '@quarks/share-domain';
import { getTestingService } from '../lib/service';

export const type = 'TESTING_ACTIVE';

export const handle = async (
  event: EventPayload<{ metadata: { needActive?: string } }>,
  env: Env,
): Promise<void> => {
  const {
    metadata: { needActive },
  } = event.payload;
  const testing = getTestingService(env);
  if (needActive) {
    await testing.active(needActive);
  }
};

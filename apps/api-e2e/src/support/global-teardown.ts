import { killPort } from '@nx/node/utils';
import { getEnv, ENV, DEFAULTS } from '@quarks/share-const';

declare global {
  var __TEARDOWN_MESSAGE__: string | undefined;
}

module.exports = async function () {
  // Put clean up logic here (e.g. stopping services, docker-compose, etc.).
  // Hint: `globalThis` is shared between setup and teardown.
  const port = Number(getEnv(undefined, ENV.PORT, String(DEFAULTS.PORT)));
  await killPort(port);
  console.log(globalThis.__TEARDOWN_MESSAGE__);
};

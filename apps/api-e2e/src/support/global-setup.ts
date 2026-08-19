import { waitForPortOpen } from '@nx/node/utils';
import { getEnv, ENV, DEFAULTS } from '@quarks/share-const';

declare global {
  var __TEARDOWN_MESSAGE__: string | undefined;
}

module.exports = async function () {
  // Start services that that the app needs to run (e.g. database, docker-compose, etc.).
  console.log('\nSetting up...\n');

  const host = getEnv(undefined, ENV.HOST, DEFAULTS.HOST);
  const port = Number(getEnv(undefined, ENV.PORT, String(DEFAULTS.PORT)));
  await waitForPortOpen(port, { host });

  // Hint: Use `globalThis` to pass variables to global teardown.
  globalThis.__TEARDOWN_MESSAGE__ = '\nTearing down...\n';
};

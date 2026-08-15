/* eslint-disable */
import axios from 'axios';
import { getEnv, ENV, DEFAULTS } from '@quarks/share/const';

module.exports = async function () {
  // Configure axios for tests to use.
  const host = getEnv(undefined, ENV.HOST, DEFAULTS.HOST);
  const port = getEnv(undefined, ENV.PORT, String(DEFAULTS.PORT));
  axios.defaults.baseURL = `http://${host}:${port}`;
};

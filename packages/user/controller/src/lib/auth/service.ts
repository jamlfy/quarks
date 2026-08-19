import type { SocialOAuth, AuthEnv } from '@quarks/user-data';

import * as facebook from './facebook';
import * as google from './google';

const SOCIAL_CONNECTORS: SocialOAuth = {
  [facebook.name]: facebook,
  [google.name]: google,
};

export const SOCIAL_PROVIDERS = Object.keys(SOCIAL_CONNECTORS);

export const buildAuthUrl = (
  provider: string,
  callbackUrl: string,
  env: AuthEnv,
) => {
  const clientIdKey = `AUTH_${provider.toUpperCase()}_ID`;
  const clientId = env[clientIdKey];
  if (!clientId) throw new Error(`Missing ${provider}`);

  const social = SOCIAL_CONNECTORS[provider];
  if (!social || !social.buildAuthUrl)
    throw new Error(`Unsupported provider: ${provider}`);
  return social.buildAuthUrl(callbackUrl, clientId);
};

export const exchangeCode = (
  provider: string,
  code: string,
  callbackUrl: string,
  env: AuthEnv,
) => {
  const clientIdKey = `AUTH_${provider.toUpperCase()}_ID`;
  const clientSecretKey = `AUTH_${provider.toUpperCase()}_SECRET`;
  const clientId = env[clientIdKey];
  const clientSecret = env[clientSecretKey];
  if (!clientId || !clientSecret) return null;

  const social = SOCIAL_CONNECTORS[provider];

  if (!social || !social.exchangeCode)
    throw new Error(`Unsupported provider: ${provider}`);

  return social.exchangeCode(
    {
      code,
      callbackUrl,
      clientSecret,
      clientId,
    },
    env,
  );
};

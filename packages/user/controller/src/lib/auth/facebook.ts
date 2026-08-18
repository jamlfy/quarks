import type { buildAuthUrlFunc, exchangeCodeFunc } from '@quarks/user-data';

export const name = 'facebook';

interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export const buildAuthUrl: buildAuthUrlFunc = (
  callbackUrl: string,
  clientId: string,
): string =>
  `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=email%20public_profile`;

export const exchangeCode: exchangeCodeFunc = async ({
  code,
  callbackUrl,
  clientSecret,
  clientId,
}): Promise<Record<string, unknown>> => {
  const resp = await fetch(
    `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&client_secret=${clientSecret}&code=${code}`,
  );

  if (!resp.ok)
    throw new Error(`Facebook token exchange failed: ${resp.status}`);

  const tokens = (await resp.json()) as OAuthTokenResponse;
  const userResp = await fetch(
    `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${tokens.access_token}`,
  );

  if (!userResp.ok)
    throw new Error(`Facebook userinfo fetch failed: ${userResp.status}`);

  return (await userResp.json()) as Record<string, unknown>;
};

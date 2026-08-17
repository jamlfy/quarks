import type { buildAuthUrlFunc, exchangeCodeFunc } from '@quarks/user-data';

export const name = "google";

export const buildAuthUrl: buildAuthUrlFunc = (callbackUrl: string, clientId: string): string =>
  `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=openid%20email%20profile`;

export const exchangeCode: exchangeCodeFunc = async ({ code, callbackUrl, clientSecret, clientId }): Promise<Record<string, unknown>> => {
  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: callbackUrl,
      grant_type: 'authorization_code',
    }),
  });

  const tokens: any = await resp.json();
  const userResp = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  return (await userResp.json()) as Record<string, unknown>;
};

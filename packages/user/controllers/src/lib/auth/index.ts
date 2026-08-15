import { UserService } from "@quarks/user/data";
import { sign } from 'hono/jwt';
import { buildAuthUrl, exchangeCode, SOCIAL_PROVIDERS } from "./services";
import { getEnv, ENV, DEFAULTS } from '@quarks/share/const';

export const social = (request, env) => {
  const { social } = request.params;
  if (!SOCIAL_PROVIDERS.includes(social as any)) {
    return error(400, `Unsupported provider: ${social}. Use: ${SOCIAL_PROVIDERS.join(', ')}`);
  }
  const baseUrl = new URL(request.url).origin;
  const callbackUrl = `${baseUrl}/v1/auth/${social}/callback`;
  const authUrl = buildAuthUrl(social, callbackUrl, env);
  if (request.query.redirect) {
    return Response.redirect(authUrl);
  }

  return { authUrl };
}

export socialCallback = async (request) => {
  const { social } = request.params;
  if (!SOCIAL_PROVIDERS.includes(social as any)) {
    return error(400, 'Unsupported provider');
  }
  const code = String(request.query.code || '');
  if (!code) return error(400, 'Missing code');
  const baseUrl = new URL(request.url).origin;
  const callbackUrl = `${baseUrl}/v1/auth/${social}/callback`;
  const userData = await exchangeCode(social, code, callbackUrl, request as any);
  if (!userData) return error(401, 'Failed to authenticate');
  const userS = new UserService(request.get('db'));
  const user = await userS.findOrCreateUser(social, userData);
  if (!user) return error(500, 'Failed to create user');
  const secret = request.env?.[ENV.JWT_SECRET] ?? getEnv(request.env, ENV.JWT_SECRET, DEFAULTS.JWT_SECRET);
  const token = await sign({
    id: user.id as string,
    email: user.email as string,
    name: (user.name as string) ?? null,
    isAdmin: Boolean(user.isAdmin),
  }, secret);
  const redirect = String(request.query.redirect || '/');
  return Response.redirect(`${redirect}?token=${token}`);
};

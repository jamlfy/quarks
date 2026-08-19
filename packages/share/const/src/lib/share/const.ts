export const ENV = {
  HOST: 'HOST',
  PORT: 'PORT',
  DATABASE_URL: 'DATABASE_URL',
  JWT_SECRET: 'JWT_SECRET',
  JWT_ALGO: 'RS512',
  FRONTEND_URL: 'FRONTEND_URL',
  BACKEND_URL: 'BACKEND_URL',
  MERCADO_PAGO_ACCESS_TOKEN: 'MERCADO_PAGO_ACCESS_TOKEN',
  API_VERSION: 'v1',
  TWENTY_FOUR_HOURS: 24 * 60 * 60,
} as const;

export const DEFAULTS = {
  HOST: 'localhost',
  PORT: 3000,
  JWT_SECRET: 'secreto_super_seguro_desarrollo',
  FRONTEND_URL: 'http://localhost:3000',
  BACKEND_URL: 'http://localhost:3001',
  MERCADO_PAGO_ACCESS_TOKEN: '',
  API_VERSION: 'v1',
  JWT_ALGO: 'RS512',
} as const;

export function getEnv(
  envObj: Record<string, any> | undefined,
  key: string,
  fallback?: any,
) {
  // Prefer provided env-like object (e.g., Cloudflare request.env), then process.env, then fallback
  const fromEnvObj = envObj?.[key];
  if (typeof fromEnvObj !== 'undefined') return fromEnvObj;
  const fromProcess = process.env[key];
  if (typeof fromProcess !== 'undefined') return fromProcess;
  return fallback;
}

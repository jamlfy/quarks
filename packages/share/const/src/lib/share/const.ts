export const ENV = {
  HOST: 'HOST',
  PORT: 'PORT',
  DATABASE_URL: 'DATABASE_URL',
  JWT_SECRET: 'JWT_SECRET',
} as const;

export const DEFAULTS = {
  HOST: 'localhost',
  PORT: 3000,
  JWT_SECRET: 'secreto_super_seguro_desarrollo',
} as const;

export function getEnv(envObj: Record<string, any> | undefined, key: string, fallback?: any) {
  // Prefer provided env-like object (e.g., Cloudflare request.env), then process.env, then fallback
  const fromEnvObj = envObj?.[key];
  if (typeof fromEnvObj !== 'undefined') return fromEnvObj;
  const fromProcess = process.env[key];
  if (typeof fromProcess !== 'undefined') return fromProcess;
  return fallback;
}

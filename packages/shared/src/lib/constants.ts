export const API_VERSION = 'v1';

export const TOKEN_KEY = 'quarks.token';
export const CART_KEY_PREFIX = 'quarks.cart';
export const PRODUCTS_CACHE_KEY = 'quarks.products';
export const PRODUCTS_CACHE_TTL = 5 * 60 * 1000;

export const STORE_CACHE_TTL = 300;
export const PROXY_CACHE_TTL = 60;

export const JWT_EXPIRES_IN = '7d';

export const SOCIAL_PROVIDERS = [
  'google',
  'facebook',
  'twitter',
  'github',
] as const;
export type SocialProvider = (typeof SOCIAL_PROVIDERS)[number];

export type GatewayName = 'wompi' | 'epayco' | 'paypal';

export const GATEWAYS: readonly GatewayName[] = ['wompi', 'epayco', 'paypal'];

export const PAYMENT_METHODS: Record<GatewayName, readonly string[]> = {
  wompi: ['PSE', 'CARD', 'NEQUI'],
  epayco: ['PSE', 'CARD'],
  paypal: ['PAYPAL', 'CARD'],
};

export const DEFAULT_GATEWAY: GatewayName = 'paypal';

export const GATEWAY_BY_COUNTRY: Record<
  string,
  { default: GatewayName; fallback: GatewayName }
> = {
  CO: { default: 'wompi', fallback: 'epayco' },
};

export function testingFeeVar(currency: string): string {
  return `TESTING_FEE_${currency}`;
}

export const TESTING_FEE_DEFAULT: Record<string, number> = {
  COP: 20000,
  USD: 500,
};

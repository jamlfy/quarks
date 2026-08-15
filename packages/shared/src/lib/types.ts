import type { GatewayName } from './constants';

export interface User {
  id: string;
  email: string;
  name?: string | null;
  avatar?: string | null;
  socialId?: string | null;
  socialProvider?: string | null;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Store {
  id: string;
  name: string;
  description?: string | null;
  api: string;
  mapper: Record<string, string>;
  points: string;
  theme: Record<string, unknown>;
  isActive: boolean;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  code: string;
  price?: number | null;
  currency?: string | null;
  points?: number | null;
  gateway: GatewayName[];
  metadata?: Record<string, unknown> | null;
  countryCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TestingType = 'TIME' | 'VIEWS' | 'CART' | 'PURCHASES';

export interface Testing {
  id: string;
  userId: string;
  campaing: string;
  images: string[];
  name: string;
  description: string;
  sku: string;
  price: number;
  type: TestingType;
  startAt?: string | null;
  endAt?: string | null;
  metadata?: Record<string, unknown> | null;
  countryCode: string;
  isActive: boolean;
  createdAt: string;
}

export type TransactionType = 'ADD' | 'REST';

export interface Transaction {
  id: string;
  userId: string;
  storeId?: string | null;
  type: TransactionType;
  amount: number;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELED';

export interface PaymentProduct {
  id: string;
  name: string;
  code: string;
  price: number;
  currency: string;
  points: number;
}

export interface PaymentResult {
  externalId: string;
  status: PaymentStatus;
  approveUrl?: string | null;
  paymentData?: Record<string, unknown> | null;
}

export interface WebhookEvent {
  eventId: string;
  gatewayName: GatewayName;
  reference?: string | null;
  externalId?: string | null;
  status: PaymentStatus;
  paymentCompleted: boolean;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface CheckoutResult {
  orderId: string;
  gatewayName: GatewayName;
  status: PaymentStatus;
  approveUrl?: string | null;
  paymentData?: Record<string, unknown> | null;
}

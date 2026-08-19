import { createSelectSchema } from 'drizzle-zod';
import { type InferSelectModel } from 'drizzle-orm';
import { z } from 'zod';
import { users } from './schema';

export const UserSchema: z.ZodObject<z.ZodRawShape> = createSelectSchema(
  users,
  {
    name: (schema) => schema.min(1).max(100),
    email: (schema) => schema.email(),
  },
);

export const UserUpdateSchema: z.ZodObject<z.ZodRawShape> = UserSchema.pick({
  name: true,
  email: true,
}).partial();

export const AdminUserUpdateSchema: z.ZodObject<z.ZodRawShape> =
  UserSchema.pick({
    name: true,
    email: true,
    isAdmin: true,
  }).partial();

export type IUser = InferSelectModel<typeof users>;

export type JwtUser = Omit<
  IUser,
  'avatar' | 'socialId' | 'socialProvider' | 'createdAt' | 'updatedAt'
>;

export interface JwtHelpers {
  signToken(user: JwtUser): Promise<string>;
  verifyToken(token: string): Promise<JwtUser | null>;
}

export interface ExchangeCodeOptions {
  code: string;
  callbackUrl: string;
  clientSecret: string;
  clientId: string;
}

export type buildAuthUrlFunc = (
  callbackUrl: string,
  clientId: string,
) => string;
export type exchangeCodeFunc = (
  options: ExchangeCodeOptions,
  env?: AuthEnv,
) => Promise<Record<string, unknown>>;

export interface OAuthProvider {
  name: 'google' | 'facebook';
  buildAuthUrl: buildAuthUrlFunc;
  exchangeCode: exchangeCodeFunc;
}

export type SocialOAuth = Record<OAuthProvider['name'], OAuthProvider>;

export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

export interface AuthEnv {
  [key: string]: string | undefined;
}

export interface RenewSessionPayload {
  userId: string;
  iat: number;
  exp: number;
  timestamp: number;
}

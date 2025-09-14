import type { ID, ISODate } from '@/types';

export enum AuthCredentialType {
  EMAIL_PASSWORD = 'email_password',
  USERNAME_PASSWORD = 'username_password',
}

export enum OAuthProvider {
  GOOGLE = 'google',
  DISCORD = 'discord',
  GITHUB = 'github',
  OTHER = 'other',
}

/* ===== Core Auth/Users ===== */
export interface Permission {
  id: ID;
  code: string;
  description?: string | null;
  createdAt: ISODate;
}

export interface Role {
  id: ID;
  name: string;
  description?: string | null;
  createdAt: ISODate;
}

export interface UserStatus {
  id: ID;
  code: string;     // ej: 'active', 'blocked'
  name: string;     // ej: 'Activo'
  description?: string | null;
  createdAt: ISODate;
}

export interface UserSummary {
  id: ID;
  firstName: string;
  lastName: string;
  username?: string | null;
  avatarUrl?: string | null;
}

export interface User extends UserSummary {
  externalId: string;          // uuid
  email?: string | null;
  isActive: boolean;
  status: UserStatus;
  bio?: string | null;
  createdAt: ISODate;
  updatedAt?: ISODate | null;
  deletedAt?: ISODate | null;
  roles?: Role[];
}

export interface UserCredential {
  id: ID;
  user: UserSummary;
  type: AuthCredentialType;
  identifier: string;            // email o username
  credentialHash?: string | null;
  isVerified: boolean;
  createdAt: ISODate;
  lastLoginAt?: ISODate | null;
}

export interface UserIdentity {
  id: ID;
  user: UserSummary;
  provider: OAuthProvider;
  providerUserId: string;
  providerUserData?: unknown | null;
  accessToken?: string | null;
  refreshToken?: string | null;
  expiresAt?: ISODate | null;
  createdAt: ISODate;
}

export interface UserSession {
  id: string;                   // uuid
  user: UserSummary;
  userAgent?: string | null;
  ipAddress?: string | null;
  createdAt: ISODate;
  lastActiveAt?: ISODate | null;
  revokedAt?: ISODate | null;
}

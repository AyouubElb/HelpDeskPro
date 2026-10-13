import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../../config/env.js';
import { Role } from '../../generated/prisma/client.js';
import { unauthorized } from '../../lib/errors.js';

export const ACCESS_TOKEN_COOKIE = 'access_token';
export const ACCESS_TOKEN_TTL_SECONDS = 8 * 60 * 60; // one work shift

export interface AuthUser {
  id: string;
  role: Role;
}

const payloadSchema = z.object({ sub: z.string(), role: z.enum(Role) });

export function signAccessToken(user: AuthUser): string {
  return jwt.sign({ role: user.role }, env.JWT_SECRET, {
    algorithm: 'HS256',
    subject: user.id,
    expiresIn: ACCESS_TOKEN_TTL_SECONDS,
  });
}

/** Throws 401 when the token is invalid, expired, or signed with another algorithm. */
export function verifyAccessToken(token: string): AuthUser {
  try {
    const payload = payloadSchema.parse(jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] }));
    return { id: payload.sub, role: payload.role };
  } catch {
    throw unauthorized();
  }
}

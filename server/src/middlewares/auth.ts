import type { Request, RequestHandler } from 'express';
import type { Role } from '../generated/prisma/client.js';
import { forbidden, unauthorized } from '../lib/errors.js';
import { ACCESS_TOKEN_COOKIE, verifyAccessToken, type AuthUser } from '../modules/auth/auth.tokens.js';

/** Reads the JWT from the httpOnly cookie and attaches the user to the request. */
export const authenticate: RequestHandler = (req, _res, next) => {
  const token: unknown = req.cookies?.[ACCESS_TOKEN_COOKIE];
  if (typeof token !== 'string') throw unauthorized();

  req.user = verifyAccessToken(token);
  next();
};

export const requireRole =
  (...roles: Role[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) throw forbidden();
    next();
  };

/** The authenticated user. Only valid behind `authenticate`. */
export function currentUser(req: Request): AuthUser {
  if (!req.user) throw unauthorized();
  return req.user;
}

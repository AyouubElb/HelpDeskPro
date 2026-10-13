import type { CookieOptions, Request, Response } from 'express';
import { env } from '../../config/env.js';
import { currentUser } from '../../middlewares/auth.js';
import { loginSchema } from './auth.schemas.js';
import * as authService from './auth.service.js';
import { ACCESS_TOKEN_COOKIE, ACCESS_TOKEN_TTL_SECONDS } from './auth.tokens.js';

const cookieOptions: CookieOptions = {
  httpOnly: true, // never readable by JavaScript
  sameSite: 'strict',
  secure: env.NODE_ENV === 'production',
  path: '/',
};

export async function login(req: Request, res: Response) {
  const { user, token } = await authService.login(loginSchema.parse(req.body));
  res.cookie(ACCESS_TOKEN_COOKIE, token, { ...cookieOptions, maxAge: ACCESS_TOKEN_TTL_SECONDS * 1000 });
  res.json(user);
}

export async function me(req: Request, res: Response) {
  res.json(await authService.getProfile(currentUser(req).id));
}

export function logout(_req: Request, res: Response) {
  res.clearCookie(ACCESS_TOKEN_COOKIE, cookieOptions);
  res.status(204).end();
}

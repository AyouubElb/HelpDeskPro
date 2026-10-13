import type { AuthUser } from '../modules/auth/auth.tokens.js';

declare global {
  namespace Express {
    interface Request {
      /** Set by the `authenticate` middleware. */
      user?: AuthUser;
    }
  }
}

export {};

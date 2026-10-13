import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { authenticate } from '../../middlewares/auth.js';
import * as authController from './auth.controller.js';

// Brute-force protection: only failed attempts count.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
    },
  },
});

export const authRouter = Router();

authRouter.post('/login', loginLimiter, authController.login);
authRouter.get('/me', authenticate, authController.me);
authRouter.post('/logout', authController.logout);

import { AppError, unauthorized } from '../../lib/errors.js';
import { prisma } from '../../lib/prisma.js';
import { publicUserSelect } from '../users/users.service.js';
import type { LoginInput } from './auth.schemas.js';
import { signAccessToken } from './auth.tokens.js';
import { DUMMY_HASH, verifyPassword } from './password.js';

export async function login({ email, password }: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email } });

  // Always run bcrypt, even for an unknown email: the response time must not reveal which emails exist.
  const passwordMatches = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !passwordMatches) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Email ou mot de passe incorrect.');
  }

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token: signAccessToken(user),
  };
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: publicUserSelect });
  if (!user) throw unauthorized();
  return user;
}
